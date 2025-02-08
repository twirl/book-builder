import { Href, OpaqueString } from './Types';

export type BibliographyItemAlias = OpaqueString<'bibliographyItemAlias'>;

export interface Reference {
    bibliographyItemAlias?: BibliographyItemAlias;
    text?: string;
    href?: Href;
    alt?: {
        bibliographyItemAlias?: BibliographyItemAlias;
        text?: string;
    };
    counter: number;
}

export interface BibliographyItem {
    authors: string;
    publicationDate?: string;
    title: string;
    subtitle?: string[];
    hrefs?: Href[];
}

export interface Bibliography { [alias: string]: BibliographyItem }
