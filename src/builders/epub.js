import { readFileSync } from 'fs';
import { resolve } from 'path';
import Epub from 'epub-gen';

export default async ({ lang, l10n, structure, basePath, out }) => {
    const epubData = {
        title: l10n.title,
        author: l10n.author,
        css: readFileSync(resolve(basePath, 'css/epub.css')),
        tocTitle: l10n.toc,
        appendChapterTitles: false,
        content: structure.sections.reduce(
            (content, section) => {
                if (!section.title) debugger;
                content.push({
                    title: section.title.toUpperCase(),
                    data: `<h2>${section.title}</h2>`
                });
                section.chapters.forEach((chapter) => {
                    content.push({
                        title: chapter.title,
                        data: `<h3>${chapter.title}</h3>\n${chapter.content}`
                    });
                });
                return content;
            },
            [
                {
                    title: l10n.frontPage,
                    data: structure.frontPage,
                    beforeToc: true
                }
            ]
        ),
        lang
    };
    const epub = new Epub(epubData, out);
    return epub.promise;
};
