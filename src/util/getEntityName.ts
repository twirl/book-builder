import { basename } from 'node:path';

export function getEntityName(path: string): string {
    return basename(path, '.md').replace(/^\d+-/, '');
}

export function getEntityAnchor(path: string): string {
    return basename(path, '.md')
        .toLowerCase()
        .replace(/^\d+-/, '')
        .replace(/\W+/g, '-');
}
