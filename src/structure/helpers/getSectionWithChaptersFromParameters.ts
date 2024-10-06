import { readdir, stat as fsStat } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Context } from '../../models/Context';
import { Templates } from '../../models/Templates';
import { Counters } from './counters';
import { SectionParameters } from './getSectionParametersFromSource';

export async function getSectionWithChaptersFromParameters(
    parameters: SectionParameters,
    counters: Counters,
    context: Context,
    templates: Templates
) {
    const files = [];
    for (const file of await readdir(parameters.path)) {
        const path = resolve(parameters.path, file);
        const stat = await fsStat(path);
        if (stat.isFile() && file.endsWith('.md')) {
            files.push({ path, stat });
        }
    }

    const chapters = [];
    for (const { path, stat } of files.sort()) {
        const chapterCounter = counters.getChapterCountIncrement();
        const range = context.options.chapterRange;
        if (
            range === undefined ||
            (chapterCounter >= range[0] && chapterCounter <= range[1])
        ) {
            const chapter = await appendChapterToSection(
                path,
                stat,
                counters,
                context,
                templates
            );
            chapters.push(chapter);
        }
    }

    if (context.options.hoistSingleChapters && chapters.length === 0) {
        return {
            ...parameters,
            content: chapters[0],
            chapters: []
        };
    } else {
        return {
            ...parameters,
            chapters
        };
    }
}
