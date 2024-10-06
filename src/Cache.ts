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

    public async get(
        path: string,
        dateMs: number,
        transform: (b: Buffer) => Promise<string>
    ): Promise<string> {
        const cachedContent = await this.tryGet(path, dateMs);
        if (cachedContent !== null) {
            return cachedContent.toString('utf-8');
        } else {
            const content = await transform(await readFile(path));
            await this.put(this.pathToCachedFile(path), content);
            return content;
        }
    }

    public async getJson<T>(
        path: string,
        dateMs: number,
        transform: <I>(b: I) => Promise<T>
    ): Promise<T> {
        const cachedContent = await this.tryGetJson<T>(path, dateMs);
        if (cachedContent !== null) {
            return cachedContent;
        } else {
            const content = await readFile(path);
            const json = await transform(JSON.parse(content.toString('utf-8')));
            await this.put(this.pathToCachedFile(path), content);
            return json;
        }
    }

    private async tryGet(path: string, dateMs: number): Promise<Buffer | null> {
        if (this.disabled) {
            return null;
        }
        try {
            const fileName = this.pathToCachedFile(path);
            if ((await stat(fileName)).mtimeMs >= dateMs) {
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
                return json;
            } catch (e) {
                this.logger.error(e);
                return null;
            }
        }
    }

    private async put(path: string, data: any) {
        if (!this.disabled) {
            try {
                const fileName = this.pathToCachedFile(path);
                await writeFile(fileName, Cache.toBuffer(data));
            } catch (e) {
                console.error(e);
            }
        }
    }

    private pathToCachedFile(path: string) {
        return resolve(this.dir, Cache.pathToFileName(path));
    }

    private static pathToFileName(path: string) {
        return path.replace(/[^\w\d-_]/g, '_');
    }

    private static toBuffer(data: any): Buffer {
        return Buffer.isBuffer(data)
            ? data
            : typeof data == 'string'
              ? Buffer.from(data, 'binary')
              : Buffer.from(JSON.stringify(data), 'utf-8');
    }
}
