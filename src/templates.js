const templates = (module.exports = {
    screenHtml: (html, css, l10n) => {
        return `<html><head>
            <meta charset="utf-8"/>
            <title>${l10n.author}. ${l10n.title}</title>
            <meta name="author" content="${l10n.author}"/>
            <meta name="description" content="${l10n.description}"/>
            <meta property="og:title" content="${l10n.author}. ${l10n.title}"/>
            <meta property="og:url" content="${l10n.url}"/>
            <meta property="og:type" content="article"/>
            <meta property="og:description" content="${l10n.description}"/>
            <meta property="og:locale" content="${l10n.locale}"/>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=PT+Serif&amp;family=PT+Sans&amp;family=Inconsolata"/>
            <style>${css}</style>
        </head><body>
            <article>
                ${html}
            </article>
        </body></html>`;
    },

    printHtml: (html, css, l10n) => {
        return `<html><head>
            <meta charset="utf-8"/>
            <title>${l10n.author}. ${l10n.title}</title>
            <meta name="author" content="${l10n.author}"/>
            <meta name="description" content="${l10n.description}"/>
            <meta property="og:title" content="${l10n.author}. ${l10n.title}"/>
            <meta property="og:url" content="${l10n.url}"/>
            <meta property="og:type" content="article"/>
            <meta property="og:description" content="${l10n.description}"/>
            <meta property="og:locale" content="${l10n.locale}"/>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=PT+Serif&amp;family=PT+Sans&amp;family=Inconsolata"/>
            <style>${css}</style>
        </head><body>
            <article>
                ${html}
            </article>
        </body></html>`;
    },

    toc: (structure, l10n) => {
        return `<nav><h2 class="toc">${
            l10n.toc
        }</h2><ul class="table-of-contents">${structure.sections
            .map((section) => {
                return `<li><a href="#${section.anchor}">${
                    section.title
                }</a><ul>${section.chapters
                    .map((chapter) => {
                        return `<li><a href="#${chapter.anchor}">${chapter.title}</a></li>`;
                    })
                    .join('')}</ul></li>`;
            })
            .join('')}</ul></nav>${templates.pageBreak}`;
    },

    ref: (anchor, content) => {
        return `<a href="#${anchor}" class="anchor" name="${anchor}">${content}</a>`;
    },

    sectionTitle: (section) => {
        return section.title
            ? `<h2>${templates.ref(section.anchor, section.title)}</h2>`
            : '';
    },

    chapterTitle: (chapter) => {
        return `<h3>${templates.ref(chapter.anchor, chapter.title)}</h3>`;
    },

    chapterTitleValue: ({ titles, l10n, counter }) => {
        return `${l10n.chapter} ${counter}. ${titles.join('. ')}`;
    },

    h5Value: ({ value, number }) => {
        return typeof number == 'undefined' ? value : `${number}. ${value}`;
    },

    pageBreak: '<div style="page-break-after: always;"></div>',

    imgLinkTree: ({ src, href, title, alt, position }) => {
        const fullTitle = `${title}. Image credit: ${alt}`;
        return {
            type: 'element',
            tagName: 'div',
            properties: {
                style: 'page-break-inside: never'
            },
            children: [
                {
                    type: 'element',
                    tagName: 'img',
                    properties: {
                        src,
                        alt: fullTitle,
                        title: fullTitle
                    },
                    position
                },
                {
                    type: 'element',
                    tagName: 'h6',
                    children: [
                        {
                            type: 'text',
                            value: title
                        }
                    ],
                    position
                },
                {
                    type: 'element',
                    tagName: 'h6',
                    children: [
                        {
                            type: 'text',
                            value: 'Image credit: '
                        },
                        {
                            type: 'element',
                            tagName: 'a',
                            properties: {
                                href: href,
                                title: fullTitle
                            },
                            children: [
                                {
                                    type: 'text',
                                    value: alt
                                }
                            ],
                            position
                        }
                    ],
                    position
                }
            ],
            position
        };
    }
});
