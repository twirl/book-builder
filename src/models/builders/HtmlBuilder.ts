import { Builder } from '../Builder';

export type HtmlBuilder<T, S> = Builder<T, S, HtmlBuilderOptions, 'html'>;

export interface HtmlBuilderOptions {
    css: string;
    outFile: string;
}
