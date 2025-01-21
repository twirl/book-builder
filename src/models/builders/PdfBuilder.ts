import { Builder } from '../Builder';
import { Path } from '../Types';

export type PdfBuilder<T, S> = Builder<T, S, PdfBuilderOptions, 'pdf'>;

export interface PdfBuilderOptions {
    css: string;
    outFile: Path;
    useCachedContent?: boolean;
}
