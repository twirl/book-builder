import { Stats } from 'node:fs';

import { Chapter } from '../../models/Chapter';
import { Context } from '../../models/Context';
import { markdownToAst } from '../../preprocessors/markdown';
import { getEntityAnchor, getEntityName } from '../../util/getEntityName';
import { readUtf8File } from '../../util/readFile';
import { Counters } from './Counters';

export const buildChapterFromSource = async (
    path: string,
    fileStat: Stats,
    counters: Counters,
    context: Context
): Promise<Chapter> => {
    return context.cache.getCachedJsonOrPutToCache<Chapter>(
        path,
        fileStat.mtimeMs,
        async () => {
            const md = await readUtf8File(path);
            const ast = await markdownToAst(md);
            const counter = counters.getChapterCount();

            return {
                content: ast,
                title: chapterTitle(path),
                anchor: chapterAnchor(path),
                counter
            };
        }
    );
};

export const chapterTitle = (path: string, headers?: string[]) =>
    headers && headers.length ? headers.join('. ') : getEntityName(path);

export const chapterAnchor = (path: string) => getEntityAnchor(path);
