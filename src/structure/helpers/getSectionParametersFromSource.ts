import { readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Context } from '../../models/Context';
import { Source } from '../../models/Source';
import { Templates } from '../../models/Templates';

export async function getSectionParametersFromSource(
    source: Source,
    context: Context,
    templates: Templates
) {
    const sectionDirs = [];
    for (const path of await readdir(source.dir)) {
        const fullPath = resolve(source.dir, path);
        if ((await stat(fullPath)).isDirectory()) {
            sectionDirs.push({
                path,
                fullPath
            });
        }
    }
    return sectionDirs
        .sort((a, b) => (a.path < b.path ? -1 : 1))
        .map(({ path, fullPath }, index) => ({
            path: fullPath,
            title: templates.sectionTitle(path, index, context),
            anchor: templates.sectionAnchor(path, index, context)
        }));
}

export interface SectionParameters {
    path: string;
    title: string;
    anchor: string;
}
