import { StructurePluginState } from '../../models/plugins/StructurePlugin';
import { Structure } from '../../structure/Structure';
import { applyAstPluginToStructure } from '../../util/applyAstPluginToStructure';
import {
    highlighter as highlighterAst,
    HighlighterOptions
} from '../structureAst/highlighter';

export const highlighter =
    (options?: HighlighterOptions) =>
    <T, S>(structure: Structure, state: StructurePluginState<T, S>) =>
        applyAstPluginToStructure(
            state.context,
            state.l10n,
            structure,
            highlighterAst(options)
        );
