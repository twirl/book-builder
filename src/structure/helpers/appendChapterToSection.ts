import { Stats } from 'node:fs';

import { Context } from '../../models/Context';
import { Templates } from '../../models/Templates';

export async function parseChapterFile(
    path: string,
    stat: Stats,
    context: Context,
    templates: Templates
) {
    return context.cache.getJson(path, stat.mtimeMs, async (buffer) =>
        htmlPreProcess(buffer)
    );
}
