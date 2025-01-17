import { Href, OpaqueString } from './Types';

export type BibliographyItemAlias = OpaqueString<'bibliographyItemAlias'>;

export interface Reference {
    bibliographyItemAlias?: BibliographyItemAlias;
    text?: string;
    href?: Href;
    counter: number;
}

export interface BibliographyItem {
    authors: string;
    publicationDate?: string;
    title: string;
    subtitle?: string[];
    hrefs?: Href[];
}

export type Bibliography = { [alias: string]: BibliographyItem };
