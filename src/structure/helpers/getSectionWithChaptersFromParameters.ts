import { readdir, stat as fsStat } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Context } from '../../models/Context';
import { L10n } from '../../models/L10n';
import { ChapterAstPlugin } from '../../models/plugins/ChapterAstPlugin';
import { Strings } from '../../models/Strings';
import { Templates } from '../../models/Templates';
import { Section } from '../Structure';
import { buildChapterFromSource } from './buildChapterFromSource';
import { Counters } from './Counters';
import { SectionParameters } from './getSectionParametersFromSource';

export const getSectionWithChaptersFromParameters = async <T, S>(
    parameters: SectionParameters,
    counters: Counters,
    context: Context,
    l10n: L10n<T, S>,
    chapterAstPlugins: ChapterAstPlugin<T, S>[]
) => {
    const files = [];
    for (const file of await readdir(parameters.path)) {
        const path = resolve(parameters.path, file);
        const stat = await fsStat(path);
        if (stat.isFile() && file.endsWith('.md')) {
            files.push({ path, stat });
        }
    }

    const section = new Section(
        parameters.title,
        parameters.anchor,
        counters.getSectionCountIncremented()
    );
    for (const { path, stat } of files.sort()) {
        const chapterCounter = counters.getChapterCountIncremented();
        const range = context.options.chapterRange;
        if (
            range === undefined ||
            (chapterCounter >= range[0] && chapterCounter <= range[1])
        ) {
            section.appendChapter(
                await buildChapterFromSource(
                    path,
                    stat,
                    counters,
                    l10n,
                    context,
                    chapterAstPlugins
                )
            );
        }
    }

    if (
        context.options.hoistSingleChapters &&
        section.getChapters().length === 0
    ) {
        return new Section(
            section.title,
            section.anchor,
            section.counter,
            section.getChapters()[0].ast
        );
    } else {
        return section;
    }
};
