import { Context } from '../models/Context';
import { getEntityName } from '../util/getEntityName';

export const DEFAULT_TEMPLATES = {
    sectionTitle: (path: string, _index: number, _context: Context) =>
        getEntityName(path),
    sectionAnchor: (_path: string, index: number, _context: Context) =>
        `section-${index + 1}`,

    fonts: (fonts: string[]) =>
        fonts.length
            ? `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fonts
                  .map((f) => `family=${encodeURIComponent(f)}`)
                  .join('&amp;')}"/>`
            : '',

    screenHtml: (
        content,
        css,
        { l10n, fonts = [], resolveSrc, structure, templates }
    ) => {
        return `<!doctype html><html lang="${l10n.locale}"><head>
            <meta charset="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>${l10n.author}. ${l10n.title}</title>
            <meta name="author" content="${l10n.author}"/>
            <meta name="description" content="${l10n.description}"/>
            <meta property="og:title" content="${l10n.author}. ${l10n.title}"/>
            <meta property="og:url" content="${l10n.url}"/>
            <meta property="og:type" content="article"/>
            <meta property="og:description" content="${l10n.description}"/>
            <meta property="og:locale" content="${l10n.locale}"/>
            <link rel="icon" href="${resolveSrc(l10n.favicon)}"/>
            ${templates.fonts(fonts)}
            <style>${css}</style>
        </head><body>${templates.screenContent(content, css, {
            structure,
            l10n,
            templates
        })}</body></html>`;
    },

    screenContent: (content: string) => `<article>${content}</article>`,

    printHtml: (content, css, { l10n, fonts = [], templates }) => {
        return `<!doctype html><html lang="${l10n.locale}"><head>
            <meta charset="utf-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>${l10n.author}. ${l10n.title}</title>
            <meta name="author" content="${l10n.author}"/>
            <meta name="description" content="${l10n.description}"/>
            <meta property="og:title" content="${l10n.author}. ${l10n.title}"/>
            <meta property="og:url" content="${l10n.url}"/>
            <meta property="og:type" content="article"/>
            <meta property="og:description" content="${l10n.description}"/>
            <meta property="og:locale" content="${l10n.locale}"/>
            ${templates.fonts(fonts)}
            <style>${css}</style>
        </head><body>
            <article>
                ${content}
            </article>
        </body></html>`;
    },

    pageBreak: '<div style="page-break-after: always;"></div>',

    mainContent: (content: string) =>
        `<section class="main-content">${content}</section>`,

    toc: (structure, l10n) => {
        return `<nav><h2 class="toc">${
            l10n.toc
        }</h2><ul class="table-of-contents">${structure.sections
            .map((section) => {
                return `<li><a href="#${section.anchor}">${section.title}</a>${
                    section.chapters
                        ? `<ul>${section.chapters
                              .map((chapter) => {
                                  return `<li><a href="#${chapter.anchor}">${chapter.title}</a></li>`;
                              })
                              .join('')}</ul>`
                        : ''
                }</li>`;
            })
            .join('')}</ul></nav>${templates.pageBreak}`;
    },

    link: (anchor, content, href, className = 'anchor') => {
        return `<a href="${escapeHtml(
            href || `#${anchor}`
        )}" class="${className}" id="${escapeHtml(anchor)}">${content}</a>`;
    },

    html: {
        sectionTitle: (section) => {
            return section.title
                ? `<h2>${templates.link(section.anchor, section.title)}</h2>`
                : '';
        }
    },

    chapterTitle: (chapter) => {
        return `<h3>${templates.link(chapter.anchor, chapter.title)}${
            chapter.secondaryAnchor
                ? templates.link(
                      chapter.secondaryAnchor,
                      ' ',
                      undefined,
                      'secondary-anchor'
                  )
                : ''
        }</h3>`;
    },

    chapterTitleValue: ({ titleParts, l10n, counter }) => {
        return `${l10n.chapter} ${counter}. ${titleParts
            .map(({ title }) => title)
            .join('. ')}`;
    },

    reference: ({ localCounter }) => {
        return `<sup>${localCounter}</sup>`;
    },

    bibliography: (items, l10n, anchor) =>
        `<ul class="bibliography">${items
            .map((item) => templates.bibliographyItem(item, l10n, anchor))
            .join('\n')}</ul>`,

    bibliographyItem: (item, l10n, anchor) =>
        `<li><p><a class="alias" id="${anchor}-${escapeHtml(
            item.alias
        )}">${templates
            .joinReferenceParts(item.short, item.extra || [])
            .trim()}</a>${
            item.href
                ? `<br/><a target="_blank" class="external" href="${escapeHtml(
                      item.href
                  )}">${escapeHtml(item.href)}</a>`
                : ''
        }</p></li>`,

    joinReferenceParts: (...args) => {
        const parts = [].concat(...args).filter((s) => Boolean(s));
        const text = parts.reduce((s, t, i) => {
            const delimiter =
                i > 0
                    ? parts[i - 1].at(-1).match(/[\.\?\!\)]/)
                        ? ' '
                        : '. '
                    : '';
            return (
                s +
                delimiter +
                (i % 2 == 1 ? `<em>${escapeHtml(t)}</em>` : escapeHtml(t))
            );
        }, '');
        return text ? ' ' + text : '';
    },

    referenceList: (items, l10n) => {
        return `<h4>${l10n.references}</h4><ul class="references">${items
            .map((text) => `<li><p>${text}</p></li>`)
            .join('\n')}</ul>`;
    },

    referenceText: (ref, l10n, templates) => {
        const text =
            ref.text ||
            `${templates.joinReferenceParts(
                ref.short,
                ref.extra || []
            )}${templates.referencePage(ref, l10n)}`;
        const href = ref.href
            ? templates.referenceHref(ref.href, text, l10n, templates)
            : '';
        return `${templates.referenceBackLink(ref, l10n)}<span>${text.trim()}${
            href && text ? '<br/>' : ''
        }${href}</span>`;
    },

    referenceHref: (href, text, l10n, templates) => {
        const scheme = href.split(':')[0] ?? 'https';
        switch (scheme) {
            case 'http':
            case 'https':
                return templates.referenceHttpHref(href, text, l10n);
            case 'isbn':
                return templates.referenceIsbnHref(href, text, l10n);
        }
    },

    referenceHttpHref: (href, text) =>
        `<a target="_blank" class="external${
            text ? '' : ' text'
        }" href="${escapeHtml(href)}">${escapeHtml(href)}</a>`,

    referenceIsbnHref: (href, text, l10n) =>
        `${l10n.isbn} ${escapeHtml(href.replace('isbn:', ''))}`,

    referenceSourceIbid: (ref, source, l10n, samePage = false) =>
        `${templates.referenceBackLink(ref, l10n)}<span>${l10n.ibid}${
            samePage ? templates.referencePage(ref, l10n) : ''
        }</span>`,

    referenceIbid: (ref, l10n, samePage = false) =>
        `${templates.referenceBackLink(ref, l10n)}<span>${l10n.ibid}${
            samePage ? templates.referencePage(ref, l10n) : ''
        }</span>`,

    referenceSourceFull: (ref, source, l10n, anchor) =>
        `${templates.referenceBackLink(
            ref,
            l10n
        )}<span><a class="ref-to-bibliography" href="#${anchor}-${
            source.alias
        }">${escapeHtml(source.short)}${
            source.short.at(-1).match(/[\.\?\!\)]/) ? '' : '.'
        }${templates.joinReferenceParts(
            ref.short,
            ref.extra || []
        )}</a>${templates.referencePage(ref, l10n)}${
            ref.href
                ? `<br/><a target="_blank" class="external" href="${escapeHtml(
                      ref.href
                  )}">${escapeHtml(ref.href)}</a>`
                : ''
        }</span>`,

    referenceBackLink: ({ anchor, localCounter, backAnchor }) =>
        templates.link(
            anchor,
            `<sup>${localCounter}</sup> `,
            `#${backAnchor}`,
            'back-anchor'
        ),

    referencePage: ({ page }, l10n) => {
        if (!page) {
            return '';
        } else if (page.match(/^\d+$/)) {
            return `, ${l10n.page} ${page}`;
        } else if (page.match(/^[\d,-\s]+$/)) {
            return `, ${l10n.pages} ${escapeHtml(page)}`;
        } else if (page.at(-1) == ':') {
            return `, ${l10n.refChapter} ${escapeHtml(
                page.replace(/^"|":$/g, '')
            )}`;
        } else {
            return ` <em>${escapeHtml(page.replace(/^"|"$/g, ''))}</em>`;
        }
    },

    h5Value: ({ value, number }) => {
        return typeof number == 'undefined' ? value : `${number}. ${value}`;
    },

    aImg: ({ src, href, title, alt, l10n, className = 'img-wrapper' }) => {
        const fullTitle = escapeHtml(
            `${title}${title.at(-1).match(/[\.\?\!\)]/) ? ' ' : '. '} ${
                alt == 'PD' ? l10n.publicDomain : `${l10n.imageCredit}: ${alt}`
            }`
        );
        return `<div class="${escapeHtml(className)}"><img src="${escapeHtml(
            src
        )}" alt="${fullTitle}" title="${fullTitle}"/><h6>${escapeHtml(
            title
        )}. ${
            alt == 'PD'
                ? l10n.publicDomain
                : `${escapeHtml(l10n.imageCredit)}: ${
                      href
                          ? `<a href="${escapeHtml(href)}">${escapeHtml(
                                alt
                            )}</a>`
                          : escapeHtml(alt)
                  }`
        }</h6></div>`;
    },

    code: (code, language) =>
        `<pre><code class="language-${language}">${code}</code></pre>`
} as const;
