import escapeHtml from 'escape-html';
import { Root } from 'hast';

import { Chapter } from '../models/Chapter';
import { Context } from '../models/Context';
import { CssClasses } from '../models/CssClasses';
import { Strings } from '../models/Strings';
import { Section, Structure } from '../structure/Structure';
import { astToHtml } from '../util/astToHtml';
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

    protected htmlString(c: keyof S) {
        return escapeHtml(String(this.strings[c]));
    }

    protected htmlHref(href: string) {
        return `href="${escapeHtml(href)}"`;
    }

    protected cssClass(c: keyof C) {
        return ` class="${escapeHtml(
            typeof this.cssClasses[c] === 'string'
                ? this.cssClasses[c]
                : kebabCase(c.toString())
        )}"`;
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

    public async htmlDocument(
        structure: Structure,
        css: string
    ): Promise<string> {
        return `<!doctype html><html lang="${
            this.locale
        }"><head>${await this.htmlHead(css)}</head><body>${await this.htmlBody(
            await this.htmlStructure(structure)
        )}</body></html>`;
    }

    public async htmlHead(css: string) {
        return `<meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${this.htmlString('author')}. ${this.htmlString('title')}</title>
        <meta name="author" content="${this.htmlString('author')}"/>
        <meta name="description" content="${this.htmlString('description')}"/>
        <meta property="og:title" content="${this.htmlString('author')}. ${this.htmlString('title')}"/>
        <meta property="og:url" content="${this.htmlString('landingUrl')}"/>
        <meta property="og:type" content="article"/>
        <meta property="og:description" content="${this.htmlString('description')}"/>
        <meta property="og:locale" content="${escapeHtml(this.locale)}"/>
        <link rel="icon" ${this.htmlHref(this.strings.favicon)}/>
        <style>${css}</style>`;
    }

    public async htmlBody(body: string) {
        return `<article>${body}</article>`;
    }

    public async htmlStructure(structure: Structure) {
        const htmlParts = [];
        for (const section of structure.getSections()) {
            htmlParts.push(await this.htmlSection(section));
        }
        return htmlParts.join(await this.htmlPageBreak());
    }

    public async htmlTableOfContents(structure: Structure) {
        return `<nav><h2>${this.htmlString(
            'toc'
        )}</h2><ul ${this.cssClass('tableOfContents')}>${structure
            .getSections()
            .reduce((sectionHtml: string[], section) => {
                if (section.inTableOfContents()) {
                    sectionHtml.push(
                        `<li><a ${this.htmlHref('#' + section.anchor)}>${escapeHtml(
                            this.sectionTitle(section)
                        )}</a>${
                            section.getChapters().length
                                ? `<ul>${section
                                      .getChapters()
                                      .map((chapter) => {
                                          return `<li><a ${this.htmlHref(
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
            .join('')}</ul></nav>`;
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
        return htmlParts.join('');
    }

    public async htmlSectionTitle(section: Section) {
        return section.title
            ? `<h2>${
                  section.anchor
                      ? await this.htmlAnchor(
                            this.sectionTitle(section),
                            section.anchor
                        )
                      : this.sectionTitle(section)
              }</h2>`
            : '';
    }

    public async htmlSectionContent(content: Root) {
        return astToHtml(content);
    }

    public async htmlChapter(chapter: Chapter) {
        return `${await this.htmlChapterTitle(chapter)}${await this.htmlChapterContent(
            chapter.content
        )}`;
    }

    public async htmlChapterTitle(chapter: Chapter) {
        return `<h3>${await this.htmlAnchor(
            this.chapterTitle(chapter),
            chapter.anchor
        )}</h3>`;
    }

    public async htmlChapterContent(content: Root) {
        return astToHtml(content);
    }

    public async htmlAnchor(text: string, anchor: string) {
        return `<a ${this.cssClass('anchorLink')} name="${escapeHtml(
            anchor
        )}" id="${escapeHtml(anchor)}" href="#${escapeHtml(
            anchor
        )}">${escapeHtml(text)}</a>`;
    }

    public async htmlAImg(params: aImgParams) {
        return `<div ${this.cssClass('imgWrapper')}>${await this.htmlAImgImage(
            params
        )}${await this.htmlAImgTitle(params)}</div>`;
    }

    public async htmlAImgTitle(params: aImgParams) {
        return `<h6>${escapeHtml(this.imageTitle(params))}</h6>`;
    }

    public async htmlAImgImage(params: aImgParams) {
        const fullTitle = this.imageTitle(params);
        return `<img src="${escapeHtml(
            params.src
        )}" alt="${fullTitle}" title="${fullTitle}"${
            params.size ? ` class="${params.size}"` : ''
        }/>`;
    }

    public async htmlPageBreak() {
        return `<div ${this.cssClass('pageBreak')}></div>`;
    }

    public async htmlCode(html: string, language: string) {
        return `<pre><code data-language="${escapeHtml(language)}">${html}</code></pre>`;
    }
}

export interface aImgParams {
    src: string;
    href: string;
    title: string;
    alt: string;
    size?: string;
}
