import { Href, OpaqueString } from './Types';

export type BibliographyItemAlias = OpaqueString<'bibliographyItemAlias'>;

export interface Reference {
    bibliographyItemAlias?: BibliographyItemAlias;
    text: string;
    href?: Href;
    counter: number;
}

export interface BibliographyItem {
    alias: BibliographyItemAlias;
    authors: string;
    publicationDate?: string;
    title: string;
    subtitle?: string[];
    href?: Href;
}

export type Bibliography = { [alias: string]: BibliographyItem };
