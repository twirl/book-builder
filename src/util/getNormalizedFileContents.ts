import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import unorm from 'unorm';

export async function getNormalizedFileContents(
    ...pathParts: string[]
): Promise<string> {
    return unorm.nfd((await readFile(resolve(...pathParts))).toString('utf-8'));
}
