import { Root } from 'hast';

import { Chapter } from '../models/Chapter';
import { Context } from '../models/Context';
import { CssClasses } from '../models/CssClasses';
import {
    Bibliography,
    BibliographyItem,
    BibliographyItemAlias,
    Reference
} from '../models/Reference';
import { Strings } from '../models/Strings';
import { Href, HtmlString } from '../models/Types';
import { Section } from '../structure/Section';
import { Structure } from '../structure/Structure';
import { astToHtml } from '../util/astToHtml';
import { escapeHtml } from '../util/escapeHtml';
import { getEntityAnchor } from '../util/getEntityName';
import { kebabCase } from '../util/strings';
import { isFieldDefined } from '../util/types';

export class DefaultTemplates<
    S extends Strings = Strings,
    C extends CssClasses = CssClasses
> {
    constructor(
        protected readonly context: Context,
        protected readonly language: string,
        protected readonly locale: string,
        protected readonly strings: S,
        protected readonly cssClasses: Partial<C> = {}
    ) {}

    protected string(c: keyof S): HtmlString {
        return escapeHtml(String(this.strings[c]));
    }

    protected href(href: string) {
        return `href="${escapeHtml(href)}"` as HtmlString;
    }

    protected cssClass(c: keyof C) {
        return ` class="${escapeHtml(
            typeof this.cssClasses[c] === 'string'
                ? this.cssClasses[c]
                : kebabCase(c.toString())
        )}"` as HtmlString;
    }

    public jointTitle(titles: string[]) {
        return titles.join('. ');
    }

    public sectionTitle(section: Section) {
        return section.title ?? '';
    }

    public chapterTitle(chapter: Chapter) {
        return `${this.strings.chapterTitle} ${chapter.counter}. ${chapter.title}`;
    }

    public imageTitle({ title }: AImgParams) {
        return title;
    }

    public referenceAnchor(
        ref: Reference,
        chapter: Chapter,
        _section: Section
    ) {
        return `${chapter.anchor}-ref-${ref.counter}`;
    }

    public referenceBackAnchor(
        ref: Reference,
        chapter: Chapter,
        _section: Section
    ) {
        return `${chapter.anchor}-ref-${ref.counter}-back`;
    }

    public linkText(href: Href): string {
        return href.replace(/^[\w\+]+\:\/\//, '').replace(/\/$/, '');
    }

    public bibliographyItemAnchor(
        alias: BibliographyItemAlias,
        _item: BibliographyItem
    ) {
        return `bibliography-${getEntityAnchor(alias)}`;
    }

    public bibliographyItemShortName(bibliographyItem: BibliographyItem) {
        return `${bibliographyItem.authors}${
            bibliographyItem.publicationDate
                ? ' (' + bibliographyItem.publicationDate + ')'
                : ''
        }`;
    }

    public epubSectionFilename(section: Section) {
        return section.anchor + '.xhtml';
    }

    public epubChapterFilename(chapter: Chapter) {
        return chapter.anchor + '.xhtml';
    }

    public async htmlDocument(structure: Structure, css: string) {
        return `<!doctype html><html lang="${
            this.locale
        }"><head>${await this.htmlHead(css)}</head><body>${await this.htmlBody(
            await this.htmlStructure(structure),
            structure
        )}</body></html>` as HtmlString;
    }

    public async htmlHead(css: string) {
        return `<meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${this.string('author')}. ${this.string('title')}</title>
        <meta name="author" content="${this.string('author')}"/>
        <meta name="description" content="${this.string('description')}"/>
        <meta property="og:title" content="${this.string('author')}. ${this.string('title')}"/>
        <meta property="og:url" content="${this.string('landingUrl')}"/>
        <meta property="og:type" content="article"/>
        <meta property="og:description" content="${this.string('description')}"/>
        <meta property="og:locale" content="${escapeHtml(this.locale)}"/>
        <link rel="icon" ${this.href(this.strings.favicon)}/>
        <style>${css}</style>` as HtmlString;
    }

    public async htmlBody(body: string, _structure: Structure) {
        return `<article>${body}</article>` as HtmlString;
    }

    public async htmlStructure(structure: Structure) {
        const htmlParts = [];
        for (const section of structure.getSections()) {
            htmlParts.push(await this.htmlSection(section));
        }
        return htmlParts.join(await this.htmlPageBreak()) as HtmlString;
    }

    public async htmlTableOfContents(structure: Structure) {
        return `<nav><h2>${this.string(
            'toc'
        )}</h2><ul ${this.cssClass('tableOfContents')}>${structure
            .getSections()
            .reduce((sectionHtml: string[], section) => {
                if (section.inTableOfContents()) {
                    sectionHtml.push(
                        `<li><a ${this.href('#' + section.anchor)}>${escapeHtml(
                            this.sectionTitle(section)
                        )}</a>${
                            section.getChapters().length
                                ? `<ul>${section
                                      .getChapters()
                                      .map((chapter) => {
                                          return `<li><a ${this.href(
                                              '#' + chapter.anchor
                                          )}>${escapeHtml(
                                              this.chapterTitle(chapter)
                                          )}</a></li>`;
                                      })
                                      .join('')}</ul>`
                                : ''
                        }</li>`
                    );
                }
                return sectionHtml;
            }, [])
            .join('')}</ul></nav>` as HtmlString;
    }

    public async htmlSection(section: Section) {
        const htmlParts = [];
        const content = section.getContent();
        if (content) {
            htmlParts.push(await this.htmlSectionContent(content));
        }
        for (const chapter of section.getChapters()) {
            htmlParts.push(await this.htmlChapter(chapter));
        }
        return `<section>${await this.htmlSectionTitle(
            section
        )}${htmlParts.join(
            await this.htmlPageBreak()
        )}</section>` as HtmlString;
    }

    public async htmlSectionTitle(section: Section) {
        return (
            section.title
                ? `<h2>${
                      section.anchor
                          ? await this.htmlAnchor(
                                this.sectionTitle(section),
                                section.anchor
                            )
                          : this.sectionTitle(section)
                  }</h2>`
                : ''
        ) as HtmlString;
    }

    public async htmlSectionContent(content: Root) {
        return astToHtml(content);
    }

    public async htmlChapter(chapter: Chapter) {
        return `${await this.htmlChapterTitle(chapter)}${await this.htmlChapterContent(
            chapter.content
        )}` as HtmlString;
    }

    public async htmlChapterTitle(chapter: Chapter) {
        return `<h3>${await this.htmlAnchor(
            this.chapterTitle(chapter),
            chapter.anchor
        )}</h3>` as HtmlString;
    }

    public async htmlChapterContent(content: Root) {
        return astToHtml(content);
    }

    public async htmlAnchor(text: string, anchor: string) {
        return `<a ${this.cssClass('anchorLink')} id="${escapeHtml(
            anchor
        )}" href="#${escapeHtml(
            anchor
        )}">${escapeHtml(text)}</a>` as HtmlString;
    }

    public async htmlAImg(params: AImgParams) {
        return `<div ${this.cssClass('imgWrapper')}>${await this.htmlAImgImage(
            params
        )}${await this.htmlAImgTitle(params)}</div>` as HtmlString;
    }

    public async htmlAImgTitle(params: AImgParams) {
        return `<h6>${escapeHtml(this.imageTitle(params))}</h6>` as HtmlString;
    }

    public async htmlAImgImage(params: AImgParams) {
        const fullTitle = this.imageTitle(params);
        return `<img src="${escapeHtml(
            params.src
        )}" alt="${fullTitle}" title="${fullTitle}"${
            params.size ? ` class="${params.size}"` : ''
        }/>` as HtmlString;
    }

    public async htmlH5Counter(
        counter: number,
        iteration: number,
        content: string,
        chapter: Chapter,
        _section: Section
    ) {
        return `<h5>${await this.htmlAnchor(
            `${counter}. ${content}`,
            `${chapter.anchor}-para-${counter}${
                iteration > 1 ? '-' + iteration : ''
            }`
        )}</h5>` as HtmlString;
    }

    public async htmlInPlaceReference(
        ref: Reference,
        chapter: Chapter,
        section: Section,
        isSuccessiveRefs: boolean = false
    ) {
        const anchor = escapeHtml(
            this.referenceBackAnchor(ref, chapter, section)
        );
        return `<sup ${this.cssClass(
            'inPlaceReference'
        )}>${isSuccessiveRefs ? '·' : ''}<a id="${anchor}" href="#${escapeHtml(
            this.referenceAnchor(ref, chapter, section)
        )}">${ref.counter}</a></sup>` as HtmlString;
    }

    public async htmlExternalLink(
        href: Href,
        text: HtmlString,
        cssClass: keyof C = 'externalLink'
    ) {
        return `<a target="_blank" ${this.cssClass(cssClass)} href="${escapeHtml(
            href
        )}">${text}</a>` as HtmlString;
    }

    public async htmlChapterReferences(
        refs: Reference[],
        chapter: Chapter,
        section: Section,
        bibliography?: Bibliography,
        prependPath?: string
    ) {
        const refValues: HtmlString[] = [];
        for (let i = 0; i < refs.length; i++) {
            refValues.push(
                await this.htmlReference(
                    refs[i],
                    i > 0 ? refs[i - 1] : null,
                    chapter,
                    section,
                    bibliography,
                    prependPath
                )
            );
        }
        return `<h4>${this.string('references')}</h4><ul ${this.cssClass(
            'references'
        )}>${refValues.map((v) => `<li>${v}</li>`).join('')}</ul>` as HtmlString;
    }

    public async htmlReference(
        ref: Reference,
        prevRef: Reference | null,
        chapter: Chapter,
        section: Section,
        bibliography?: Bibliography,
        prependPath: string = ''
    ) {
        const anchor = escapeHtml(this.referenceAnchor(ref, chapter, section));
        const link = await this.htmlReferenceLink(ref);
        return `<p><a ${this.cssClass('backAnchor')} href="${escapeHtml(
            prependPath
        )}#${escapeHtml(
            this.referenceBackAnchor(ref, chapter, section)
        )}" id="${anchor}"><sup>${ref.counter}</sup>&nbsp;</a><span>${
            isFieldDefined(ref, 'alt')
                ? await this.htmlAltReference(ref, prevRef, bibliography)
                : `${await this.htmlReferenceText(
                      ref,
                      prevRef,
                      bibliography
                  )}${link ? '<br/>' + link : ''}</span>`
        }` as HtmlString;
    }

    public async htmlReferenceLink(
        ref: Reference,
        cssClass: keyof C = 'externalLink'
    ): Promise<HtmlString | null> {
        return ref.href
            ? await this.htmlExternalLink(
                  ref.href,
                  escapeHtml(this.linkText(ref.href)),
                  cssClass
              )
            : null;
    }

    public async htmlReferenceText(
        ref: Reference,
        prevRef: Reference | null,
        bibliography?: Bibliography
    ) {
        if (ref.bibliographyItemAlias) {
            if (bibliography && bibliography[ref.bibliographyItemAlias]) {
                return this.htmlReferenceBibliographyItem(
                    ref,
                    prevRef,
                    ref.bibliographyItemAlias,
                    bibliography[ref.bibliographyItemAlias]
                );
            } else {
                this.context.logger.error(
                    'Cannot find a bibliography item',
                    ref
                );
                return '[ERROR]' as HtmlString;
            }
        } else {
            return ref.text as HtmlString;
        }
    }

    public async htmlAltReference(
        ref: Reference & Required<Pick<Reference, 'alt'>>,
        prevRef: Reference | null,
        bibliography?: Bibliography
    ) {
        const alt = ref.alt;
        if (!alt.bibliographyItemAlias && !alt.text) {
            this.context.logger.error(
                'Alt reference must contain either text or alias',
                ref
            );
        }
        if (
            alt.bibliographyItemAlias &&
            (!bibliography || !bibliography[alt.bibliographyItemAlias])
        ) {
            this.context.logger.error('Unknown alt bibliography alias', ref);
        }
        const link = await this.htmlReferenceLink(ref, 'referenceInlineLink');
        return `${this.string('referenceSee')} “${await this.htmlReferenceText(
            ref,
            prevRef,
            bibliography
        )}”${link ? ` &middot; ${link}` : ''} ${this.string('referenceOr')} ${
            alt.bibliographyItemAlias &&
            bibliography &&
            bibliography[alt.bibliographyItemAlias]
                ? await this.htmlAltReferenceBibliographyItem(
                      ref,
                      prevRef,
                      alt.bibliographyItemAlias,
                      bibliography[alt.bibliographyItemAlias]
                  )
                : escapeHtml(alt.text ?? '[ERROR]')
        }` as HtmlString;
    }

    public async htmlReferenceBibliographyItem(
        ref: Reference,
        prevRef: Reference | null,
        alias: BibliographyItemAlias,
        item: BibliographyItem
    ) {
        if (
            prevRef &&
            prevRef.bibliographyItemAlias === ref.bibliographyItemAlias
        ) {
            return `${this.string('ibid')}${ref.text ? ', ' + escapeHtml(ref.text) : ''}` as HtmlString;
        } else {
            return `<a ${this.cssClass(
                'refToBibliography'
            )} href="#${this.bibliographyItemAnchor(alias, item)}">${this.bibliographyItemShortName(
                item
            )}</a>${ref.text ? ', ' + escapeHtml(ref.text) : ''}` as HtmlString;
        }
    }

    public async htmlAltReferenceBibliographyItem(
        ref: Reference & Required<Pick<Reference, 'alt'>>,
        _prevRef: Reference | null,
        alias: BibliographyItemAlias,
        item: BibliographyItem
    ) {
        return `<a ${this.cssClass(
            'refToBibliography'
        )} href="#${this.bibliographyItemAnchor(alias, item)}">${this.bibliographyItemShortName(
            item
        )}</a>${
            ref.alt.text ? ', ' + escapeHtml(ref.alt.text) : ''
        }` as HtmlString;
    }

    public async htmlPageBreak() {
        return `<div ${this.cssClass('pageBreak')}></div>` as HtmlString;
    }

    public async htmlCode(html: string, language: string) {
        return `<pre><code data-language="${escapeHtml(
            language
        )}">${html}</code></pre>` as HtmlString;
    }

    public async htmlBibliography(bibliography: Bibliography) {
        const items = Object.entries(bibliography)
            .map(([alias, item]) => ({
                title: this.bibliographyItemShortName(item),
                item,
                alias: alias as BibliographyItemAlias
            }))
            .sort((a, b) => (a.title < b.title ? -1 : 1));
        const htmlParts: HtmlString[] = [];
        for (const { item, alias } of items) {
            htmlParts.push(await this.htmlBibliographyItem(alias, item));
        }
        return `<ul ${this.cssClass('bibliography')}>${htmlParts
            .map((i) => `<li>${i}</li>`)
            .join('')}</ul>`;
    }

    public async htmlBibliographyItem(
        alias: BibliographyItemAlias,
        item: BibliographyItem
    ) {
        const anchor = escapeHtml(this.bibliographyItemAnchor(alias, item));
        return `<p><a id="${anchor}">${await this.htmlBibliographyItemFullName(
            item
        )}</a>${
            item.hrefs && item.hrefs.length
                ? '<br/>' + (await this.htmlBibliographyHrefs(item.hrefs))
                : ''
        }</p>` as HtmlString;
    }

    public async htmlBibliographyHrefs(hrefs: Href[]): Promise<HtmlString> {
        const htmlParts: HtmlString[] = [];
        for (const href of hrefs) {
            const match = href.trim().match(/^\w+\:/);
            const scheme = match ? match[0] : 'unknown:';
            switch (scheme) {
                case 'http:':
                case 'https:':
                    htmlParts.push(
                        await this.htmlExternalLink(
                            href,
                            escapeHtml(this.linkText(href))
                        )
                    );
                    break;
                case 'isbn:':
                    htmlParts.push(
                        `ISBN ${escapeHtml(href.slice(5))}` as HtmlString
                    );
                    break;
                default:
                    this.context.logger.error(
                        'Cannot resolve hyperlink scheme',
                        href
                    );
                    htmlParts.push(escapeHtml(href));
            }
        }
        return htmlParts.join('<br/>') as HtmlString;
    }

    public async htmlBibliographyItemFullName(item: BibliographyItem) {
        return `${escapeHtml(
            this.bibliographyItemShortName(item)
        )} ${await this.htmlBibliographyItemTitle(item)}` as HtmlString;
    }

    public async htmlBibliographyItemTitle(item: BibliographyItem) {
        const titleParts = [item.title, ...(item.subtitle ?? [])].map(
            (part, index) =>
                index % 2 ? escapeHtml(part) : `<em>${escapeHtml(part)}</em>`
        );
        return titleParts.join('. ') as HtmlString;
    }

    public async htmlEpubSectionContent(section: Section) {
        const content = section.getContent();
        return this.htmlEpubDocument(content);
    }

    public async htmlEpubChapterContent(chapter: Chapter, _section: Section) {
        return this.htmlEpubDocument(chapter.content);
    }

    public async htmlEpubDocument(root?: Root) {
        return root ? astToHtml(root) : ('' as HtmlString);
    }

    public async htmlPdfDocument(structure: Structure, css: string) {
        return this.htmlDocument(structure, css);
    }

    public async htmlPdfHeaderTemplate() {
        return `<span style="text-align:center">${this.string(
            'author'
        )}. ${this.string('title')}</span>` as HtmlString;
    }

    public async htmlPdfFooterTemplate() {
        return `<span class="pageNumber" style="text-align: center"></span>` as HtmlString;
    }
}

export interface AImgParams {
    src: string;
    href: Href;
    title: string;
    alt: string;
    size?: string;
}
