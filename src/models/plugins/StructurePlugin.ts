import { Structure } from '../../structure/Structure';
import { Context } from '../Context';
import { L10n } from '../L10n';

export type StructurePlugin<T, S> = (
    structure: Structure,
    state: StructurePluginState<T, S>
) => Promise<void>;

export interface StructurePluginState<T, S> {
    l10n: L10n<T, S>;
    context: Context;
}
