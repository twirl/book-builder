import { writeFile } from 'node:fs/promises';

import { Builder, BuilderState } from '../../models/Builder';
import { HtmlPlugin } from '../../models/plugins/HtmlPlugin';
import { Structure } from '../../structure/Structure';

export type HtmlBuilder<T, S> = Builder<T, S, HtmlBuilderOptions, HtmlPlugin>;

export const htmlBuilder: HtmlBuilder<any, any> = async <T, S>(
    structure: Structure,
    state: BuilderState<T, S>,
    options: HtmlBuilderOptions,
    htmlPlugins: HtmlPlugin[] = []
) => {
    const htmlParts = [];
    const templates = state.l10n.templates;
    for (const section of structure.getSections()) {
        if (section.getContent()) {
            htmlParts.push(await templates.htmlSectionContent(section, state));
        }
        for (const chapter of section.getChapters()) {
            htmlParts.push(await templates.htmlChapterContent(chapter, state));
        }
    }

    const htmlDocumentParts = {
        htmlBody: htmlParts.join(''),
        htmlHead: '',
        css: options.css
    };
    let html = templates.htmlDocument(htmlDocumentParts, state);

    for (const plugin of htmlPlugins) {
        html = await plugin(html, state);
    }

    await writeFile(options.outFile, html);
};

export interface HtmlBuilderOptions {
    css: string;
    outFile: string;
}
