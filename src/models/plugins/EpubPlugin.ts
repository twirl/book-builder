import { BuilderState } from '../Builder';
import { HtmlString } from '../Types';

export type EpubPlugin = <T, S>(
    html: string,
    state: BuilderState<T, S>
) => Promise<HtmlString>;
