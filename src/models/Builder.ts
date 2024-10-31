import { Structure } from '../structure/Structure';
import { Context } from './Context';
import { L10n } from './L10n';

export type Builder<T, S, O, P> = (
    structure: Structure,
    state: BuilderState<T, S>,
    options: O,
    plugins?: P[]
) => Promise<void>;

export interface BuilderState<T, S> {
    context: Context;
    l10n: L10n<T, S>;
}
