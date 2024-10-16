import { Structure } from '../structure/Structure';
import { Context } from './Context';
import { L10n } from './L10n';

export type Builder<T, S, O> = (
    state: BuilderState<T, S>,
    options: O
) => Promise<void>;

export interface BuilderState<T, S> {
    context: Context;
    structure: Structure;
    l10n: L10n<T, S>;
}
