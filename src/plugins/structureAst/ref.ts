import { ElementContent } from 'hast';

import { Action } from '../../models/AstPlugin';
import {
    StructureAstPlugin,
    StructureAstState
} from '../../models/plugins/StructureAstPlugin';
import { BibliographyItemAlias, Reference } from '../../models/Reference';
import { Href } from '../../models/Types';
import { htmlToAstElements } from '../../preprocessors/html';

export const ref = <T, S>(
    options: RefAstPluginOptions
): StructureAstPlugin<T, S> => ({
        init: async (state) => new RefAstPluginRunner<T, S>(state, options)
    });

export class RefAstPluginRunner<T, S> {
    private readonly refs: Reference[] = [];
    private readonly matchRe: RegExp;
    private counter: number;
    private isSuccessiveRefs = false;

    constructor(
        private readonly state: StructureAstState<T, S>,
        private readonly options: RefAstPluginOptions
    ) {
        this.matchRe = new RegExp(
            '^' +
                `${this.options.prefix}(?::(?<alias>[\\w-_]+))?(?:\\s+(?<text>[^\\|]+))?` +
                `(?:\\|\\s*${this.options.prefix}(?::(?<altAlias>[\\w-_]+))?(?:\\s+(?<altText>.+))?)?` +
                '$'
        );
        this.counter = options.continueCountFrom ?? 1;
    }

    public async run(node: ElementContent): Promise<Action<ElementContent>> {
        if (node.type === 'element' && node.tagName === 'a') {
            const {href} = node.properties;
            const content = node.children[0];
            if (content?.type === 'text') {
                const ref = this.matchReferenceContent(
                    this.counter,
                    content.value,
                    href ? String(href) : undefined
                );
                if (ref) {
                    this.counter++;
                    this.refs.push(ref);
                    const newValue = await htmlToAstElements(
                        await this.state.l10n.templates.htmlInPlaceReference(
                            ref,
                            this.state.chapter,
                            this.state.section,
                            this.isSuccessiveRefs
                        )
                    );
                    this.isSuccessiveRefs = true;
                    return {
                        action: 'replace',
                        newValue
                    };
                }
            }
        }
        this.isSuccessiveRefs = false;
        return { action: 'continue_nested' };
    }

    public matchReferenceContent(
        counter: number,
        content: string,
        href?: string
    ): Reference | null {
        const match = content.match(this.matchRe);
        if (match?.groups) {
            const {groups} = match;
            const {alias} = groups;
            const alt =
                groups.altAlias || groups.altText
                    ? {
                          bibliographyItemAlias:
                              groups.altAlias as BibliographyItemAlias,
                          text: groups.altText
                      }
                    : undefined;
            const ref: Reference = {
                bibliographyItemAlias: alias
                    ? (alias as BibliographyItemAlias)
                    : undefined,
                text: groups.text,
                href: href ? (href as Href) : undefined,
                alt,
                counter
            };
            return ref;
        } else {
            return null;
        }
    }

    public async finish() {}

    public getRefs() {
        return this.refs;
    }
}

export interface RefAstPluginOptions {
    prefix: string;
    continueCountFrom?: number;
}
