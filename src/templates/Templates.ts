import { Root } from 'hast';

import { Chapter } from '../models/Chapter';
import { Context } from '../models/Context';
import { CssClasses } from '../models/CssClasses';
import { Bibliography, BibliographyItem, Reference } from '../models/Reference';
import { Strings } from '../models/Strings';
import { Href, HtmlString } from '../models/Types';
import { Section, Structure } from '../structure/Structure';
import { astToHtml } from '../util/astToHtml';
import { escapeHtml } from '../util/escapeHtml';
import { getEntityAnchor } from '../util/getEntityName';
import { kebabCase } from '../util/strings';

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

    public imageTitle({ title }: aImgParams) {
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
        return href.replace(/^[\w\+]+\:\/\//, '');
    }

    public bibliographyItemAnchor(bibliographyItem: BibliographyItem) {
        return `bibliography-${getEntityAnchor(bibliographyItem.alias)}`;
    }

    public async htmlDocument(structure: Structure, css: string) {
        return `<!doctype html><html lang="${
            this.locale
        }"><head>${await this.htmlHead(css)}</head><body>${await this.htmlBody(
            await this.htmlStructure(structure)
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

    public async htmlBody(body: string) {
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
        const htmlParts = [await this.htmlSectionTitle(section)];
        const content = section.getContent();
        if (content) {
            htmlParts.push(
                await this.htmlSectionContent(content),
                await this.htmlPageBreak()
            );
        }
        for (const chapter of section.getChapters()) {
            htmlParts.push(
                await this.htmlChapter(chapter),
                await this.htmlPageBreak()
            );
        }
        return htmlParts.join('') as HtmlString;
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
        return `<a ${this.cssClass('anchorLink')} name="${escapeHtml(
            anchor
        )}" id="${escapeHtml(anchor)}" href="#${escapeHtml(
            anchor
        )}">${escapeHtml(text)}</a>` as HtmlString;
    }

    public async htmlAImg(params: aImgParams) {
        return `<div ${this.cssClass('imgWrapper')}>${await this.htmlAImgImage(
            params
        )}${await this.htmlAImgTitle(params)}</div>` as HtmlString;
    }

    public async htmlAImgTitle(params: aImgParams) {
        return `<h6>${escapeHtml(this.imageTitle(params))}</h6>` as HtmlString;
    }

    public async htmlAImgImage(params: aImgParams) {
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
            `${chapter.anchor}:${counter}${
                iteration > 1 ? ':' + iteration : ''
            }`
        )}</h5>` as HtmlString;
    }

    public async htmlInPlaceReference(
        ref: Reference,
        chapter: Chapter,
        section: Section
    ) {
        const anchor = escapeHtml(
            this.referenceBackAnchor(ref, chapter, section)
        );
        return `<sup ${this.cssClass(
            'inPlaceReference'
        )}><a name="${anchor}" id="${anchor}" href="#${escapeHtml(
            this.referenceAnchor(ref, chapter, section)
        )}">${ref.counter}</a></sup>` as HtmlString;
    }

    public async htmlChapterReferences(
        refs: Reference[],
        chapter: Chapter,
        section: Section,
        bibliography?: Bibliography
    ) {
        const refValues: HtmlString[] = [];
        for (let i = 0; i < refs.length; i++) {
            refValues.push(
                await this.htmlReference(
                    refs[i],
                    i > 0 ? refs[i - 1] : null,
                    chapter,
                    section,
                    bibliography
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
        bibliography?: Bibliography
    ) {
        // <p>
        // <a href="#ref-chapter-19-no-19-back" class="back-anchor" id="ref-chapter-19-no-19"><sup>1</sup>&nbsp;</a>
        // <span>Token Bucket<br>
        // <a target="_blank" class="external" href="https://en.wikipedia.org/wiki/Token_bucket">https://en.wikipedia.org/wiki/Token_bucket</a></span></p>
        const anchor = escapeHtml(this.referenceAnchor(ref, chapter, section));
        const link = await this.htmlReferenceLink(ref);
        return `<p><a ${this.cssClass('backAnchor')} href="#${escapeHtml(
            this.referenceBackAnchor(ref, chapter, section)
        )}" name="${anchor}" id="${anchor}"><sup>${
            ref.counter
        }</sup>&nbsp;</a><span>${await this.htmlReferenceText(
            ref,
            prevRef,
            bibliography
        )}${link ? '<br/>' + link : ''}</span>` as HtmlString;
    }

    public async htmlReferenceLink(ref: Reference): Promise<HtmlString | null> {
        return ref.href
            ? (`<a target="_blank" ${this.cssClass('externalLink')} href="${escapeHtml(
                  ref.href
              )}">${this.linkText(ref.href)}</a>` as HtmlString)
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

    public async htmlReferenceBibliographyItem(
        ref: Reference,
        prevRef: Reference | null,
        bibliographyItem: BibliographyItem
    ) {
        if (
            prevRef &&
            prevRef.bibliographyItemAlias === ref.bibliographyItemAlias
        ) {
            return `${this.string('ibid')}, ${ref.text}` as HtmlString;
        } else {
            return `<a ${this.cssClass(
                'refToBibliography'
            )} href="#${this.bibliographyItemAnchor(bibliographyItem)}">${
                bibliographyItem.authors
            }${
                bibliographyItem.publicationDate
                    ? ' (' + bibliographyItem.publicationDate + ')'
                    : ''
            }</a>, ${ref.text}` as HtmlString;
        }
    }

    public async htmlPageBreak() {
        return `<div ${this.cssClass('pageBreak')}></div>` as HtmlString;
    }

    public async htmlCode(html: string, language: string) {
        return `<pre><code data-language="${escapeHtml(
            language
        )}">${html}</code></pre>` as HtmlString;
    }
}

export interface aImgParams {
    src: string;
    href: string;
    title: string;
    alt: string;
    size?: string;
}
