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
    },

    references: ({ references, position, l10n }) => {
        return {
            type: 'element',
            tagName: 'div',
            properties: {
                className: ['references']
            },
            children: [
                {
                    type: 'element',
                    tagName: 'h4',
                    children: [
                        {
                            type: 'text',
                            value: l10n.references
                        }
                    ],
                    position
                },
                {
                    type: 'element',
                    tagName: 'ul',
                    children: references.map((ref) =>
                        templates.reference({ ...ref, l10n, position })
                    )
                }
            ],
            position
        };
    },

    reference: ({
        text,
        href,
        anchor,
        backAnchor,
        counter,
        l10n,
        position
    }) => {
        const isbn = href.slice(0, 5) == 'isbn:' ? href.slice(5) : null;
        let refText;
        if (isbn || !href) {
            const match = text && text.match(/^(.+\S):(\d+)$/);
            const book = (match && match[1]) || text;
            const page = match && match[2];

            refText = book;
            if (isbn) {
                refText += ` ISBN:${isbn}`;
            }
            if (page) {
                refText += `, ${l10n.page} ${page}`;
            }
        } else {
            refText = text || href;
        }

        const ref =
            isbn || !href
                ? {
                      type: element,
                      tagName: 'span',
                      properties: {
                          className: ['ref-book']
                      },
                      children: [{ type: 'text', value: refText }],
                      position
                  }
                : {
                      type: 'element',
                      tagName: 'a',
                      properties: {
                          href: href,
                          title: refText,
                          className: ['ref-link']
                      },
                      children: [
                          {
                              type: 'text',
                              value: refText
                          }
                      ],
                      position
                  };
        return {
            type: 'element',
            tagName: 'li',
            children: [
                {
                    type: 'element',
                    tagName: 'a',
                    properties: {
                        name: anchor.replace(/^#/, ''),
                        href: backAnchor,
                        className: ['ref-counter']
                    },
                    children: [
                        {
                            type: 'text',
                            value: `^${counter}.`
                        }
                    ],
                    position
                },
                ref
            ],
            position
        };
    }
});
