import escapeHtml from 'escape-html';

import { BuilderState } from '../models/Builder';
import { Chapter } from '../models/Chapter';
import { HtmlDocumentParts } from '../models/HtmlDocument';
import { L10n } from '../models/L10n';
import { Section } from '../structure/Structure';
import { astToHtml } from '../util/astToHtml';

export const DEFAULT_TEMPLATES = {
    jointHeaders: (headers: string[]) => headers.join('. '),

    htmlDocument: <T, S>(
        document: HtmlDocumentParts,
        state: BuilderState<T, S>
    ) =>
        `<!doctype html><html lang="${
            state.l10n.locale
        }"><head>${state.l10n.templates.htmlHead(
            document.htmlHead,
            document.css,
            state
        )}</head><body>${state.l10n.templates.htmlBody(
            document.htmlBody,
            state
        )}</body></html>`,

    htmlHead: <T, S>(
        html: string,
        css: string,
        { l10n }: BuilderState<T, S>
    ) => `<meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${l10n.strings.author}. ${l10n.strings.title}</title>
        <meta name="author" content="${l10n.strings.author}"/>
        <meta name="description" content="${l10n.strings.description}"/>
        <meta property="og:title" content="${l10n.strings.author}. ${l10n.strings.title}"/>
        <meta property="og:url" content="${l10n.strings.landingUrl}"/>
        <meta property="og:type" content="article"/>
        <meta property="og:description" content="${l10n.strings.description}"/>
        <meta property="og:locale" content="${l10n.locale}"/>
        <link rel="icon" href="${l10n.strings.iconUrl}"/>
        ${html}
        <style>${css}</style>`,

    htmlBody: <T, S>(body: string, _state: BuilderState<T, S>) =>
        `<article>${body}</article>`,

    htmlSectionContent: async <T, S>(
        section: Section,
        state: BuilderState<T, S>
    ) => {
        const parts: string[] = [
            state.l10n.templates.htmlSectionTitle(section, state)
        ];
        const content = section.getContent();
        if (content) {
            parts.push(await astToHtml(content));
        }

        return parts.join('');
    },

    htmlSectionTitle: <T, S>(section: Section, state: BuilderState<T, S>) =>
        `<h2>${state.l10n.templates.htmlAnchor(section.title, section.anchor)}</h2>`,

    htmlChapterContent: async <T, S>(
        chapter: Chapter,
        state: BuilderState<T, S>
    ) => {
        return (
            state.l10n.templates.htmlChapterTitle(chapter, state.l10n) +
            (await astToHtml(chapter.content))
        );
    },

    htmlChapterTitle: <T, S>(chapter: Chapter, l10n: L10n<T, S>) =>
        `<h3>${l10n.templates.htmlAnchor(chapter.title, chapter.anchor)}</h3>`,

    htmlAnchor: (text: string, anchor: string) =>
        `<a id="${escapeHtml(anchor)}">${escapeHtml(text)}</a>`,

    html: {
        aImg: <T, S>({
            src,
            href,
            title,
            alt,
            l10n: { strings },
            className = 'img-wrapper',
            size
        }: aImgParams<T, S>) => {
            const fullTitle = escapeHtml(
                `${title}${(title.at(-1) ?? '').match(/[\.\?\!\)]/) ? ' ' : '. '} ${
                    alt == 'PD'
                        ? strings.publicDomain
                        : `${strings.imageCredit}: ${alt}`
                }`
            );
            return `<div class="${escapeHtml(className)}"><img src="${escapeHtml(
                src
            )}" alt="${fullTitle}" title="${fullTitle}"${size ? ` class="size=${size}"` : ''}/><h6>${escapeHtml(
                title
            )}. ${
                alt == 'PD'
                    ? strings.publicDomain
                    : `${escapeHtml(strings.imageCredit)}: ${
                          href
                              ? `<a href="${escapeHtml(href)}">${escapeHtml(
                                    alt
                                )}</a>`
                              : escapeHtml(alt)
                      }`
            }</h6></div>`;
        }
    }
} as const;

export interface aImgParams<T, S> {
    src: string;
    href: string;
    title: string;
    alt: string;
    l10n: L10n<T, S>;
    className?: string;
    size?: string;
}
