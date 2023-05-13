import { readFileSync } from 'fs';
import { resolve } from 'path';
import htmlValidator from 'html-validator';
import Epub from 'epub-gen';

import { references } from '../references.js';

export default async ({
    lang,
    cover,
    l10n,
    structure,
    basePath,
    out,
    htmlSourceValidator
}) => {
    const epubData = {
        title: l10n.title,
        author: l10n.author,
        publisher: l10n.publisher,
        css: readFileSync(resolve(basePath, 'css/epub.css')),
        tocTitle: l10n.toc,
        appendChapterTitles: false,
        content: structure.sections.reduce(
            (content, section) => {
                content.push({
                    title: section.title.toUpperCase(),
                    data: `<h2>${section.title}</h2>`
                });
                (section.chapters || [section]).forEach((chapter) => {
                    content.push({
                        title: chapter.title,
                        filename: chapter.filename,
                        data: `<h3>${chapter.title}</h3>\n${fixLinks(
                            chapter.content
                        )}`
                    });
                });
                return content;
            },
            [
                {
                    title: l10n.frontPage.pageTitle,
                    data: structure.frontPage,
                    beforeToc: true
                }
            ]
        ),
        lang,
        cover
    };
    if (htmlSourceValidator) {
        const errors = [];
        const warnings = [];
        const ignore = [
            ...new Set(
                [].concat(htmlSourceValidator.ignore || [], [
                    'element-required-content',
                    'heading-level',
                    'element-required-attributes',
                    'element-permitted-content'
                ])
            )
        ];
        for (let index = 0; index < epubData.content.length; index++) {
            const { data } = epubData.content[index];
            try {
                const result = await htmlValidator({
                    ...htmlSourceValidator,
                    ignore,
                    data: `${data}`,
                    isFragment: true
                });
                if (result.errors.length) {
                    errors.push({
                        chapter: index + 1,
                        errors: result.errors,
                        data
                    });
                }
                if (result.warnings.length) {
                    warnings.push({
                        chapter: index + 1,
                        warnings: result.warnings
                    });
                }
            } catch (error) {
                console.error(
                    `EPUB source chapter ${
                        index + 1
                    } validation error: ${JSON.stringify(error, null, 4)}`
                );
            }
        }
        console.log(
            `EPUB source valid.\nErrors: ${JSON.stringify(
                errors,
                null,
                4
            )}\nWarnings: ${JSON.stringify(warnings, null, 4)}`
        );
    }

    const epub = new Epub(epubData, out);
    return epub.promise;
};

export function fixLinks(str) {
    const result = [];
    const internalLinkRe = /href\s*=\s*"\s*#([^"]+)"/g;
    let pos = 0;
    let match;
    while ((match = internalLinkRe.exec(str)) != null) {
        if (match.index !== pos) {
            result.push(str.slice(pos, match.index));
        }
        let href = match[1].trim();
        if (href.startsWith(references.BIBLIOGRAPHY_ANCHOR)) {
            href = `href="${references.BIBLIOGRAPHY_ANCHOR}.xhtml#${href}"`;
        } else if (href.match(/chapter-\d+-paragraph-\d+/)) {
            href = '';
        } else {
            href = `href="${href}.xhtml#${href}"`;
        }
        result.push(href);
        pos = match.index + match[0].length;
    }
    if (pos != str.length) {
        result.push(str.slice(pos));
    }

    return result.join('');
}
