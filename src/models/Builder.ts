import { BuilderMap } from '../builders';
import { Structure } from '../structure/Structure';
import { Context } from './Context';
import { L10n } from './L10n';
import { Pipeline } from './Pipeline';

export type Builder<T, S, O, B extends keyof BuilderMap<T, S>> = (
    structure: Structure,
    state: BuilderState<T, S>,
    pipeline: Pipeline<T, S, B>,
    options: O
) => Promise<void>;

export interface BuilderState<T, S> {
    context: Context;
    l10n: L10n<T, S>;
}
