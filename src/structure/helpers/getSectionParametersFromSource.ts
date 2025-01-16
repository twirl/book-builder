import { readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Context } from '../../models/Context';
import { Source } from '../../models/Source';
import { getEntityAnchor, getEntityName } from '../../util/getEntityName';

export const getSectionParametersFromSource = async (
    source: Source,
    _context: Context
) => {
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
            title: sectionTitle(path, index),
            anchor: sectionAnchor(path, index)
        }));
};

export interface SectionParameters {
    path: string;
    title: string;
    anchor: string;
}

export const sectionTitle = (path: string, _counter: number) =>
    getEntityName(path);

export const sectionAnchor = (path: string, _counter: number) =>
    getEntityAnchor(path);
