import { BuilderState } from '../Builder';
import { HtmlString } from '../Types';

export type HtmlPlugin = <T, S>(
    html: string,
    state: BuilderState<T, S>
) => Promise<HtmlString>;
