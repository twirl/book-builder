import { Context } from '../models/Context';
import { L10n } from '../models/L10n';
import {
    ChapterAstPlugin,
    ChapterState
} from '../models/plugins/ChapterAstPlugin';
import { Strings } from '../models/Strings';
import { Templates } from '../models/Templates';
import { Structure } from '../structure/Structure';
import { applyHastPluginToAst } from '../util/applyHastAstPlugin';

export const chapterAstPipeline = async <T extends Templates<Strings & S>, S>(
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
                await applyHastPluginToAst(chapter.content, plugin, state);
            }
        }
    }
};
