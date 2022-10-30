import { readFile, writeFile, stat } from 'fs/promises';
import { mkdirSync, existsSync, accessSync, constants } from 'fs';
import { resolve } from 'path';

export class Cache {
    constructor(dir) {
        this.dir = dir;
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

    async get(path, dateMs, jsonParse = false) {
        if (this.disabled) {
            return null;
        }
        try {
            const fileName = this.pathToCachedFile(path);
            if ((await stat(fileName)).mtimeMs >= dateMs) {
                return jsonParse
                    ? JSON.parse(await readFile(fileName, 'utf-8'))
                    : await readFile(fileName);
            }
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async put(path, data) {
        if (!this.disabled) {
            try {
                const fileName = this.pathToCachedFile(path);
                await writeFile(fileName, Cache.toBuffer(data));
            } catch (e) {
                console.error(e);
            }
        }
    }

    pathToCachedFile(path) {
        return resolve(this.dir, Cache.pathToFileName(path));
    }

    static pathToFileName(path) {
        return path.replace(/[^A-Za-z0-9]/g, '_');
    }

    static toBuffer(data) {
        return Buffer.isBuffer(data)
            ? data
            : typeof data == 'string'
            ? Buffer.from(data, 'binary')
            : Buffer.from(JSON.stringify(data), 'utf-8');
    }
}
