import { readFile } from 'node:fs/promises';

import { Chapter } from '../../models/Chapter';
import { Context } from '../../models/Context';
import { ChapterAstPlugin, ChapterState } from '../../models/plugins/AstPlugin';
import { Templates } from '../../models/Templates';
import { markdownToAst } from '../../preprocessors/markdown';
import { applyPluginToAst } from '../../util/applyAstPlugin';
import { Counters } from './Counters';

export const buildChapterFromSource = async (
    path: string,
    counters: Counters,
    templates: Templates,
    context: Context,
    plugins: ChapterAstPlugin[]
): Promise<Chapter> => {
    const md = await readFile(path, 'utf-8');
    const ast = await markdownToAst(md);
    const counter = counters.getChapterCount();

    const state: ChapterState = {
        counter: counter,
        title: templates.chapterTitle(
            path,
            counters.getChapterCount(),
            context
        ),
        path,
        anchor: templates.chapterAnchor(path, counter, context)
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
};
