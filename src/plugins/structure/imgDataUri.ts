import { StructurePluginState } from '../../models/plugins/StructurePlugin';
import { Structure } from '../../structure/Structure';
import { applyAstPluginToStructure } from '../../util/applyAstPluginToStructure';
import { imgDataUri as imgDataUriAst } from '../structureAst/imgDataUri';

export const imgDataUri =
    () =>
    <T, S>(structure: Structure, state: StructurePluginState<T, S>) =>
        applyAstPluginToStructure(
            state.context,
            state.l10n,
            structure,
            imgDataUriAst()
        );
