import escapeHtml from 'escape-html';

import { Context } from '../models/Context';
import { L10n } from '../models/L10n';
import { getEntityName } from '../util/getEntityName';

export const DEFAULT_TEMPLATES = {
    sectionTitle: (path: string, _counter: number, _context: Context) =>
        getEntityName(path),

    sectionAnchor: (_path: string, counter: number, _context: Context) =>
        `section-${counter + 1}`,
    chapterTitle: (
        path: string,
        _counter: number,
        _context: Context,
        headers?: string[]
    ) => (headers && headers.length ? headers.join('. ') : getEntityName(path)),

    chapterAnchor: (path: string, _counter: number, _context: Context) =>
        getEntityName(path),

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
