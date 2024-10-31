import { BuilderState } from '../Builder';

export type HtmlPlugin = <T, S>(
    html: string,
    state: BuilderState<T, S>
) => Promise<string>;
