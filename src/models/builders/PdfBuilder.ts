import { Builder } from '../Builder';

export type PdfBuilder<T, S> = Builder<T, S, PdfBuilderOptions, 'pdf'>;

export interface PdfBuilderOptions {
    css: string;
    outFile: string;
    useCachedContent?: boolean;
}
