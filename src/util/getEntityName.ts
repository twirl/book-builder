import { basename } from 'node:path';

export function getEntityName(path: string): string {
    return basename(path).replace(/^\d+\-/, '');
}

export function getEntityAnchor(path: string): string {
    return basename(path)
        .toLowerCase()
        .replace(/^\d+\-/, '')
        .replace(/\W+/g, '-');
}
