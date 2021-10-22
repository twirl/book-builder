import { resolve } from 'path';

export function resolveSrc(file, basePath) {
    return file.match(/^https?:/)
        ? file
        : resolve(basePath, file.replace(/^\//, ''));
}
