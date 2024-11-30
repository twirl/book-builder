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
import { CacheKey, Path } from './models/Types';

export class Cache {
    constructor(
        private readonly logger: Logger,
        private readonly dir: Path,
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
        dir: Path,
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
        key: CacheKey,
        dateMs: number,
        fallback: () => Promise<Buffer>,
        ext?: string
    ): Promise<Buffer> {
        const cachedContent = await this.getCached(key, dateMs);
        if (cachedContent !== null) {
            return cachedContent;
        } else {
            const content = await fallback();
            await this.putToCache(key, content, ext);
            return content;
        }
    }

    public async getCachedJsonOrPutToCache<T>(
        key: CacheKey,
        dateMs: number,
        fallback: () => Promise<T>
    ): Promise<T> {
        const cachedContent = await this.tryGetJson<T>(key, dateMs);
        if (cachedContent !== null) {
            return cachedContent;
        } else {
            const json = await fallback();
            await this.putToCache(
                key,
                Buffer.from(JSON.stringify(json, null, 4))
            );
            return json;
        }
    }

    public async getCached(
        key: CacheKey,
        dateMs: number,
        ext?: string
    ): Promise<Buffer | null> {
        if (this.disabled) {
            this.logger.debug('Cache is disabled', { key });
            return null;
        }
        try {
            const fileName = this.keyToCachedFile(key, ext);
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
        key: CacheKey,
        dateMs: number
    ): Promise<T | null> {
        const content = await this.getCached(key, dateMs);
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

    public async putToCache(
        key: CacheKey,
        data: any,
        ext?: string
    ): Promise<Path | null> {
        if (!this.disabled) {
            try {
                const fileName = this.keyToCachedFile(key, ext);
                await writeFile(fileName, Cache.toBuffer(data));
                return fileName;
            } catch (e) {
                this.logger.error('Cannot write cached data', e);
            }
        } else {
            this.logger.debug('Cache is disabled, no data written', { key });
        }
        return null;
    }

    public keyToCachedFile(key: CacheKey, ext?: string) {
        return resolve(this.dir, Cache.keyToFileName(key, ext)) as Path;
    }

    private static keyToFileName(key: CacheKey, ext?: string) {
        return key.replace(/[\W]/g, '_') + (ext ? '.' + ext : '');
    }

    private static toBuffer(data: any): Buffer {
        return Buffer.isBuffer(data)
            ? data
            : typeof data == 'string'
              ? Buffer.from(data, 'utf-8')
              : Buffer.from(JSON.stringify(data), 'utf-8');
    }
}
