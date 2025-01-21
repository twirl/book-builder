import { Builder } from '../Builder';
import { Path } from '../Types';

export type HtmlBuilder<T, S> = Builder<T, S, HtmlBuilderOptions, 'html'>;

export interface HtmlBuilderOptions {
    css: string;
    outFile: Path;
}
