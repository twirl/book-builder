import { readFile as fsReadFile } from 'node:fs/promises';

import unorm from 'unorm';

export const readUtf8File = async (path: string): Promise<string> => unorm.nfd(await fsReadFile(path, 'utf-8'));
