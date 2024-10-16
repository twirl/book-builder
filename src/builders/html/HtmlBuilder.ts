import { Builder, BuilderState } from '../../models/Builder';

export type HtmlBuilder<T, S> = Builder<T, S, HtmlBuilderOptions>;

export const htmlBuilder: HtmlBuilder<any, any> = async <T, S>(
    state: BuilderState<T, S>,
    options: HtmlBuilderOptions
) => {};

export interface HtmlBuilderOptions {
    outFile: string;
}
