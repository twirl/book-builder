import { StructurePluginState } from '../../models/plugins/StructurePlugin';
import { Structure } from '../../structure/Structure';
import { applyAstPluginToStructure } from '../../util/applyAstPluginToStructure';
import { imgSrcToFileUrl as imgSrcToFileUrlAst } from '../structureAst/imgSrcToFileUrl';

export const imgSrcToFileUrl =
    (base: string) =>
    <T, S>(structure: Structure, state: StructurePluginState<T, S>) =>
        applyAstPluginToStructure(
            state.context,
            state.l10n,
            structure,
            imgSrcToFileUrlAst(base)
        );
