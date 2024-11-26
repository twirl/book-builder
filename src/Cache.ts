import { constants } from 'node:fs';
import {
    access,
    readFile,
    writeFile,
    stat,
    mkdir,
    unlink
} from 'node:fs/promises';

import { resolve } from 'path';

import { Logger } from './models/Logger';

export class Cache {
    constructor(
        private readonly logger: Logger,
        private readonly dir: string,
        private disabled = false,
        private purgeMode = false
    ) {
        logger.debug('Cache initialized', { disabled, purgeMode });
    }

    public isEnabled() {
        return !this.disabled;
    }

    public isPurgeMode() {
        return this.purgeMode;
    }

    public static async init(
        logger: Logger,
        dir: string,
        disabled = false,
        purgeMode = false
    ): Promise<Cache> {
        if (!disabled) {
            try {
                const stats = await stat(dir);
                if (!stats.isDirectory()) {
                    logger.error(
                        `"${dir}" already exists and is not a directory`
                    );
                    return new Cache(logger, dir, true);
                }
            } catch (e) {
                try {
                    await mkdir(dir);
                } catch (e) {}
            }

            try {
                await access(dir, constants.W_OK | constants.X_OK);
            } catch (e) {
                logger.error(`${dir} is not writeable, cache is disabled`);
                return new Cache(logger, dir, true);
            }
        }
        return new Cache(logger, dir, disabled, purgeMode);
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
            await this.put(key, Buffer.from(JSON.stringify(json, null, 4)));
            return json;
        }
    }

    private async tryGet(key: string, dateMs: number): Promise<Buffer | null> {
        if (this.disabled) {
            this.logger.debug('Cache is disabled', { key });
            return null;
        }
        try {
            const fileName = this.keyToCachedFile(key);
            const stats = await stat(fileName);

            try {
                if (stats.mtimeMs > dateMs && !this.purgeMode) {
                    const content = await readFile(fileName);
                    return content;
                }
                if (this.purgeMode) {
                    await unlink(fileName);
                }
            } catch (e) {
                this.logger.error(e);
            }
        } catch (e) {
            this.logger.debug(`File not found in cache`, key);
        }
        return null;
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
                this.logger.error('Cannot read data from cache', e);
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
                this.logger.error('Cannot write cached data', e);
            }
        } else {
            this.logger.debug('Cache is disabled, no data written', { key });
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
