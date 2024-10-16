import { mkdirSync, existsSync, accessSync, constants } from 'node:fs';
import { readFile, writeFile, stat } from 'node:fs/promises';

import { resolve } from 'path';

import { Logger } from './models/Logger';

export class Cache {
    constructor(
        private readonly dir: string,
        private readonly logger: Logger,
        private disabled = false
    ) {
        if (!existsSync(dir)) {
            mkdirSync(dir);
        }
        try {
            accessSync(dir, constants.W_OK | constants.X_OK);
        } catch (e) {
            console.error(`${dir} is not writeable, cache is disabled`);
            this.disabled = true;
        }
    }

    public async getCachedOrPutToCache(
        key: string,
        dateMs: number,
        fallback: () => Promise<Buffer>
    ): Promise<Buffer> {
        const cachedContent = await this.tryGet(key, dateMs);
        if (cachedContent !== null) {
            return cachedContent;
        } else {
            const content = await fallback();
            await this.put(this.keyToCachedFile(key), content);
            return content;
        }
    }

    public async getCachedJsonOrPutToCache<T>(
        key: string,
        dateMs: number,
        fallback: () => Promise<T>
    ): Promise<T> {
        const cachedContent = await this.tryGetJson<T>(key, dateMs);
        if (cachedContent !== null) {
            return cachedContent;
        } else {
            const json = await fallback();
            await this.put(
                this.keyToCachedFile(key),
                Buffer.from(JSON.stringify(json, null, 4))
            );
            return json;
        }
    }

    private async tryGet(key: string, dateMs: number): Promise<Buffer | null> {
        if (this.disabled) {
            return null;
        }
        try {
            const fileName = this.keyToCachedFile(key);
            if ((await stat(fileName)).mtimeMs > dateMs) {
                const content = await readFile(fileName);
                return content;
            } else {
                return null;
            }
        } catch (e) {
            this.logger.error(e);
            return null;
        }
    }

    private async tryGetJson<T>(
        path: string,
        dateMs: number
    ): Promise<T | null> {
        const content = await this.tryGet(path, dateMs);
        if (content === null) {
            return null;
        } else {
            try {
                const json = JSON.parse(content.toString('utf-8'));
                return json as T;
            } catch (e) {
                this.logger.error(e);
                return null;
            }
        }
    }

    private async put(key: string, data: any) {
        if (!this.disabled) {
            try {
                const fileName = this.keyToCachedFile(key);
                await writeFile(fileName, Cache.toBuffer(data));
            } catch (e) {
                console.error(e);
            }
        }
    }

    private keyToCachedFile(key: string) {
        return resolve(this.dir, Cache.keyToFileName(key));
    }

    private static keyToFileName(key: string) {
        return key.replace(/[\W]/g, '_');
    }

    private static toBuffer(data: any): Buffer {
        return Buffer.isBuffer(data)
            ? data
            : typeof data == 'string'
              ? Buffer.from(data, 'binary')
              : Buffer.from(JSON.stringify(data), 'utf-8');
    }
}
