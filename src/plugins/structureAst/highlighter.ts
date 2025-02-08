import { ElementContent, Element } from 'hast';
import highlight, { LanguageFn } from 'highlight.js';
import typescript from 'highlight.js/lib/languages/typescript';

import { Action } from '../../models/AstPlugin.js';
import { StructureAstState } from '../../models/plugins/StructureAstPlugin.js';
import { htmlToAstElements } from '../../preprocessors/html.js';
import { createStatelessPlugin } from '../../util/statelessPlugin.js';

export const highlighter = <T, S>(options?: HighlighterOptions) => {
    const languages = options?.languages ?? [];
    const hljs = highlight.newInstance();

    for (const language of languages) {
        const name = typeof language === 'string' ? language : language.name;
        const definition =
            typeof language === 'string'
                ? DEFAULT_LANGUAGE_DEFITIONS[language]
                : language.definition;
        if (definition) {
            hljs.registerLanguage(name.toLocaleLowerCase(), definition);
        }
    }

    return createStatelessPlugin<StructureAstState<T, S>, ElementContent>(
        async (node, _context, state): Promise<Action> => {
            const code = extractCode(node);
            if (code && code.language && languages.includes(code.language)) {
                const highlighted = hljs.highlight(code.code, {
                    language: code.language
                });
                const html = highlighted.value
                    .replace(
                        /\<span[^\>]*\>\/\*\s*&lt;em&gt;\s*\*\/\<\/span\>/g,
                        '<em>'
                    )
                    .replace(
                        /\<span[^\>]*\>\/\*\s*&lt;\/em&gt;\s*\*\/\<\/span\>/g,
                        '</em>'
                    );
                return {
                    action: 'replace',
                    newValue: await htmlToAstElements(
                        await state.l10n.templates.htmlCode(html, code.language)
                    )
                };
            }
            return { action: 'continue_nested' };
        }
    );
};

export interface HighlighterOptions {
    languages?: Array<
        | string
        | {
              name: string;
              definition: LanguageFn;
          }
    >;
}

export const extractCode = (
    node: ElementContent
): null | { code: string; language: string } => {
    if (node.type === 'element') {
        if (node.tagName != 'pre' || node.children.length != 1) {
            return null;
        }
        const code = node.children[0];
        if (
            code.type !== 'element' ||
            code.tagName != 'code' ||
            code.children.length != 1 ||
            code.children[0].type != 'text'
        ) {
            return null;
        }
        const language = getClassNames(code)
            .find((c) => c.startsWith('language-'))
            ?.replace('language-', '');

        return language
            ? {
                  code: code.children[0].value,
                  language
              }
            : null;
    }
    return null;
};

export const getClassNames = (node: Element): string[] => {
    const className = node.properties?.className;
    if (typeof className === 'string') {
        return [className];
    } else if (Array.isArray(className)) {
        return className.map((v) => String(v));
    } else {
        return [];
    }
};

export const DEFAULT_LANGUAGE_DEFITIONS: Record<string, LanguageFn> = {
    json: (hljs) => {
        const ATTRIBUTE = {
            begin: /(?<!":\s*)"(\\.|[^\\"\r\n])*"/,
            className: 'attr'
        };
        const PUNCTUATION = {
            match: /{}[[\],:]/,
            className: 'punctuation'
        };
        const LITERALS = ['true', 'false', 'null'];
        const LITERALS_MODE = {
            scope: 'literal',
            beginKeywords: LITERALS.join(' ')
        };

        return {
            name: 'json',
            keywords: {
                keyword: 'GET POST PUT PATCH DELETE → …',
                literal: LITERALS
            },
            contains: [
                ATTRIBUTE,
                {
                    scope: 'string',
                    begin: /(?!^:\s*)"/,
                    end: '"'
                },
                {
                    match: /{[\w\d-_]+}|<[\w\d-_\s\\n]+>/,
                    className: 'substitution'
                },
                PUNCTUATION,
                LITERALS_MODE,
                hljs.C_NUMBER_MODE,
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE
            ]
        };
    },
    typescript
};
