import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Context } from '../models/Context';
import { Source } from '../models/Source';
import { Templates } from '../models/Templates';
import { Counters } from './helpers/counters';
import { getSectionParametersFromSource } from './helpers/getSectionParametersFromSource';
import { getSectionWithChaptersFromParameters } from './helpers/getSectionWithChaptersFromParameters';

export async function getStructure(
    source: Source,
    context: Context,
    templates: Templates
) {
    const structure = {
        sections: []
    };
    const counters = new Counters();
    // const plugins = (pipeline && pipeline.ast && pipeline.ast.preProcess) || [];
    const sectionParameters = await getSectionParametersFromSource(
        source,
        context,
        templates
    );

    for (const parameters of sectionParameters) {
        structure.sections.push(
            await getSectionWithChaptersFromParameters(
                parameters,
                counters,
                templates,
                context
            )
        );
    }

    await readdirSync(path)
        .filter((p) => statSync(resolve(path, p)).isDirectory())
        .sort()
        .reduce(async (p, dir, index) => {
            const structure = await p;
            const name = dir.replace(/^[^\-]*-/, '');
            const subdir = resolve(path, dir);
            const section = {
                title: name,
                anchor: `section-${index + 1}`,
                filename: `section-${index + 1}.xhtml`,
                chapters: []
            };

            
    return structure;
}
