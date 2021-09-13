import escapeHtml from 'escape-html';

const templates = {
    fonts: (fonts) =>
        `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fonts
            .map((f) => `family=${encodeURIComponent(f)}`)
            .join('&amp;')}"/>`,

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
            ${templates.fonts(['PT Serif', 'PT Sans', 'Inconsolata'])}
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
            ${templates.fonts(['PT Serif', 'PT Sans', 'Inconsolata'])}
            <style>${css}</style>
        </head><body>
            <article>
                ${html}
            </article>
        </body></html>`;
    },

    pageBreak: '<div style="page-break-after: always;"></div>',

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

    link: (anchor, content, href, className = 'anchor') => {
        return `<a href="${escapeHtml(
            href || `#${anchor}`
        )}" class="${className}" name="${escapeHtml(anchor)}">${content}</a>`;
    },

    sectionTitle: (section) => {
        return section.title
            ? `<h2>${templates.link(section.anchor, section.title)}</h2>`
            : '';
    },

    chapterTitle: (chapter) => {
        return `<h3>${templates.link(chapter.anchor, chapter.title)}</h3>`;
    },

    chapterTitleValue: ({ titleParts, l10n, counter }) => {
        return `${l10n.chapter} ${counter}. ${titleParts.join('. ')}`;
    },

    reference: ({ counter }) => {
        return `<sup>${counter}</sup>`;
    },

    bibliography: (items, l10n) =>
        `<ul class="bibliography">${items
            .map((item) => templates.bibliographyItem(item, l10n))
            .join('\n')}</ul>`,

    bibliographyItem: (item, l10n) =>
        `<li><p><a class="alias" name="${escapeHtml(
            item.alias
        )}">${templates.referenceTextAlias(
            item,
            l10n
        )}</a> ${templates.referenceTextExcess(item, l10n)}${
            item.href
                ? `<br/><a target="_blank" class="external" href="${escapeHtml(
                      item.href
                  )}">${escapeHtml(item.href)}</a>`
                : ''
        }</p></li>`,

    referenceList: (items, l10n) =>
        `<ul class="references">${items
            .map((i) => templates.referenceItem(i, l10n))
            .join('\n')}</ul>`,

    referenceItem: (
        { counter, anchor, backAnchor, text, page, href, alias },
        l10n
    ) => {
        return `<li><p>${templates.link(
            anchor,
            `<sup>${counter}</sup>`,
            `#${backAnchor}`,
            'back-anchor'
        )}<span>${
            alias
                ? `<a href="#${alias}">${escapeHtml(text)}</a>`
                : escapeHtml(text)
        }${templates.referencePage(page, l10n)}${
            !alias && href
                ? `<br/><a target="_blank" class="external" href="${escapeHtml(
                      href
                  )}">${escapeHtml(href)}</a>`
                : ''
        }<span></p></li>`;
    },

    referenceTextIbid: (l10n) => l10n.ibid,

    referenceTextAlias: ({ author, year }) =>
        `${author}${year ? ` (${year})` : ''}`,

    referenceTextExcess: ({ title, print, issue, isbn }, l10n) => {
        let text = ` <em>${title}</em>`;
        if (print) {
            text += `. ${print}`;
            if (issue) {
                text += `, ${issue}`;
            }
        }
        if (isbn) {
            text += `. ${l10n.isbn}: ${isbn}`;
        }
        return text;
    },

    referencePage: (page, l10n) =>
        page
            ? page.match(/^\d+$/)
                ? `, ${l10n.page} ${page}`
                : `, ${l10n.pages} ${escapeHtml(page)}`
            : '',

    h5Value: ({ value, number }) => {
        return typeof number == 'undefined' ? value : `${number}. ${value}`;
    },

    imageTitle: ({ title, l10n, alt }) =>
        `${title}. ${l10n.imageCredit}: ${alt}`,

    aImg: ({ src, href, title, alt, l10n, className = 'img-wrapper' }) => {
        const fullTitle = escapeHtml(
            templates.imageTitle({ title, l10n, alt })
        );
        return `<div className="${className}"><img src="${escapeHtml(
            src
        )}" alt="${fullTitle}" title="${fullTitle}"/><h6>${escapeHtml(
            title
        )}</h6><h6><a href="${escapeHtml(
            href
        )}" title="${fullTitle}"/>${escapeHtml(alt)}</a></h6>`;
    }
};

export default templates;
