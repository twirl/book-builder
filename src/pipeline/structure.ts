import { Context } from '../models/Context';
import { L10n } from '../models/L10n';
import {
    ChapterAstPlugin,
    ChapterState
} from '../models/plugins/ChapterAstPlugin';
import { StructurePlugin } from '../models/plugins/StructurePlugin';
import { Structure } from '../structure/Structure';
import { applyHastPluginToAst } from '../util/applyHastAstPlugin';

export const structurePipeline = async <T, S>(
    structure: Structure,
    context: Context,
    l10n: L10n<T, S>,
    plugins: Array<StructurePlugin<T, S> | ChapterAstPlugin<T, S>>
) => {
    for (const plugin of plugins) {
        switch (plugin.type) {
            case 'chapter_ast_plugin':
                for (const section of structure.getSections()) {
                    for (const chapter of section.getChapters()) {
                        const state: ChapterState<T, S> = {
                            context,
                            l10n,
                            chapter,
                            section
                        };
                        await applyHastPluginToAst(
                            chapter.content,
                            plugin,
                            state
                        );
                    }
                }
                break;
            case 'structure_plugin':
                const state = {
                    context,
                    l10n
                };
                await plugin(structure, state);
                break;
            default:
                throw new Error('Unsupported plugin type');
        }
    }
};
