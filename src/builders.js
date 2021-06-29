const fs = require('fs');
const pathResolve = require('path').resolve;

const puppeteer = require('puppeteer');
const Epub = require('epub-gen');

module.exports = {
    html: function ({ html, out }) {
        return new Promise((resolve) => {
            fs.writeFileSync(out, html);
            resolve();
        });
    },
    pdf: async function ({ out, html }) {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.setContent(html, {
            waitUntil: 'networkidle0'
        });
        const pdf = await page.pdf({
            path: out,
            preferCSSPageSize: true,
            printBackground: true
        });

        await browser.close();
    },
    epub: function ({ lang, l10n, structure, basePath, out }) {
        const epubData = {
            title: l10n.title,
            author: l10n.author,
            css: fs.readFileSync(pathResolve(basePath, 'css/epub.css')),
            tocTitle: l10n.toc,
            appendChapterTitles: false,
            content: structure.sections.reduce(
                (content, section) => {
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
    }
};
