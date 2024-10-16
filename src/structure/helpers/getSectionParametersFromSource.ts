import { readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Context } from '../../models/Context';
import { L10n } from '../../models/L10n';
import { Source } from '../../models/Source';
import { Strings } from '../../models/Strings';
import { Templates } from '../../models/Templates';

export const getSectionParametersFromSource = async <T, S>(
    source: Source,
    context: Context,
    l10n: L10n<T, S>
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
            title: l10n.templates.sectionTitle(path, index, context),
            anchor: l10n.templates.sectionAnchor(path, index, context)
        }));
};

export interface SectionParameters {
    path: string;
    title: string;
    anchor: string;
}
