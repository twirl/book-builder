import { Stats } from 'node:fs';

import { Chapter } from '../../models/Chapter';
import { Context } from '../../models/Context';
import { CacheKey, Path } from '../../models/Types';
import { markdownToAst } from '../../preprocessors/markdown';
import { getEntityAnchor, getEntityName } from '../../util/getEntityName';
import { readUtf8File } from '../../util/readFile';
import { Counters } from './Counters';

export const buildChapterFromSource = async (
    path: Path,
    fileStat: Stats,
    counters: Counters,
    context: Context
): Promise<Chapter> => context.cache.getCachedJsonOrPutToCache<Chapter>(
        path as string as CacheKey,
        fileStat.mtimeMs,
        async () => {
            const md = await readUtf8File(path);
            const ast = await markdownToAst(md);
            const counter = counters.getChapterCount();

            return {
                content: ast,
                title: chapterTitle(path),
                anchor: chapterAnchor(path),
                counter,
                modificationTimeMs: fileStat.mtimeMs
            };
        }
    );

export const chapterTitle = (path: string, headers?: string[]) =>
    headers?.length ? headers.join('. ') : getEntityName(path);

export const chapterAnchor = (path: string) => getEntityAnchor(path);
