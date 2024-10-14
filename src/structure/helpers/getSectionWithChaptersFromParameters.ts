import { readdir, stat as fsStat } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Context } from '../../models/Context';
import { Templates } from '../../models/Templates';
import { Section } from '../Section';
import { Counters } from './Counters';
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

    const section = new Section(
        parameters.title,
        parameters.anchor,
        counters.getSectionCountIncrement()
    );
    for (const { path, stat } of files.sort()) {
        const chapterCounter = counters.getChapterCountIncrement();
        const range = context.options.chapterRange;
        if (
            range === undefined ||
            (chapterCounter >= range[0] && chapterCounter <= range[1])
        ) {
            section.appendChapter(
                await buildSectionFromMd(
                    path,
                    stat,
                    counters,
                    context,
                    templates
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
}
