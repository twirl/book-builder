import { readFileSync } from 'fs';
import { resolve } from 'path';
import htmlValidator from 'html-validator';
import Epub from 'epub-gen';

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
                        data: `<h3>${
                            chapter.title
                        }</h3>\n${removeBibliographyLinks(chapter.content)}`
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

export function removeBibliographyLinks(str) {
    return str.replace(
        /\<a [^>]+bibliography-[^>]+\>([^\<]+)\<\/a>/g,
        '<span>$1</span>'
    );
}
