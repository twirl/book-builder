import { StructurePluginState } from '../../models/plugins/StructurePlugin';
import { Structure } from '../../structure/Structure';
import { applyAstPluginToStructure } from '../../util/applyAstPluginToStructure';
import { h5Counter as h5CounterAst } from '../structureAst/h5Counter';

export const h5Counter =
    () =>
    <T, S>(structure: Structure, state: StructurePluginState<T, S>) =>
        applyAstPluginToStructure(
            state.context,
            state.l10n,
            structure,
            h5CounterAst()
        );
