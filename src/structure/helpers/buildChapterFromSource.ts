import { Stats } from 'node:fs';

import { Chapter } from '../../models/Chapter';
import { Context } from '../../models/Context';
import { L10n } from '../../models/L10n';
import {
    ChapterAstPlugin,
    ChapterState
} from '../../models/plugins/ChapterAstPlugin';
import { markdownToAst } from '../../preprocessors/markdown';
import { applyPluginToAst } from '../../util/applyAstPlugin';
import { readUtf8File } from '../../util/readFile';
import { Counters } from './Counters';

export const buildChapterFromSource = async <T, S>(
    path: string,
    fileStat: Stats,
    counters: Counters,
    l10n: L10n<T, S>,
    context: Context,
    plugins: ChapterAstPlugin<T, S>[]
): Promise<Chapter> => {
    return context.cache.getCachedJsonOrPutToCache<Chapter>(
        path,
        fileStat.mtimeMs,
        async () => {
            const md = await readUtf8File(path);
            const ast = await markdownToAst(md);
            const counter = counters.getChapterCount();

            const state: ChapterState<T, S> = {
                counter: counter,
                title: l10n.templates.chapterTitle(
                    path,
                    counters.getChapterCount(),
                    context
                ),
                path,
                anchor: l10n.templates.chapterAnchor(path, counter, context),
                context,
                l10n
            };

            for (const plugin of plugins) {
                await applyPluginToAst(ast, plugin, state);
            }

            return {
                title: state.title,
                counter: state.counter,
                anchor: state.anchor,
                ast
            };
        }
    );
};
