import { Context } from '../models/Context';
import { L10n } from '../models/L10n';
import {
    ChapterAstPlugin,
    ChapterState
} from '../models/plugins/ChapterAstPlugin';
import { Structure } from '../structure/Structure';
import { applyPluginToAst } from '../util/applyAstPlugin';

export const chapterAstPipeline = async <T, S>(
    structure: Structure,
    context: Context,
    l10n: L10n<T, S>,
    plugins: ChapterAstPlugin<T, S>[]
) => {
    for (const section of structure.getSections()) {
        for (const chapter of section.getChapters()) {
            const state: ChapterState<T, S> = {
                context,
                l10n,
                chapter,
                section
            };
            for (const plugin of plugins) {
                await applyPluginToAst(chapter.content, plugin, state);
            }
        }
    }
};
