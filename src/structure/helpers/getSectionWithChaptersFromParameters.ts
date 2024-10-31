import { readdir, stat as fsStat } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Context } from '../../models/Context';
import { Section } from '../Structure';
import { buildChapterFromSource } from './buildChapterFromSource';
import { Counters } from './Counters';
import { SectionParameters } from './getSectionParametersFromSource';

export const getSectionWithChaptersFromParameters = async <T, S>(
    parameters: SectionParameters,
    counters: Counters,
    context: Context
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
                await buildChapterFromSource(path, stat, counters, context)
            );
        }
    }

    return section;
};
