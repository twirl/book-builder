import highlight from 'highlight.js';
import { htmlAst } from '../../util/html-ast.js';

export default (options) => {
    const languages = options?.languages || [];
    for (const [name, callback] of Object.entries(
        options.languageDefinitions ?? {}
    )) {
        highlight.registerLanguage(name.toLocaleLowerCase(), callback);
    }
    return () => {
        const extractCode = (node) => {
            if (node.tagName != 'pre' || node.children.length != 1) {
                return null;
            }
            const code = node.children[0];
            if (
                code.tagName != 'code' ||
                code.children.length != 1 ||
                code.children[0].type != 'text'
            ) {
                return null;
            }
            if (Object.keys(code.properties).length > 1) {
                debugger;
            }
            const language = (code.properties?.className ?? [])
                .find((c) => c.startsWith('language-'))
                ?.replace('language-', '');
            return {
                code: code.children[0].value,
                language
            };
        };

        return async (node, { data: { templates } }) => {
            const code = extractCode(node);
            if (code && code.language && languages.includes(code.language)) {
                const highlighted = highlight.highlight(code.code, {
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
                return (await htmlAst(templates.code(html, code.language)))
                    .children[0];
            }
        };
    };
};
