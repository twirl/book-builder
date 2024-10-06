import { basename } from 'node:path';

export function getEntityName(path: string): string {
    return basename(path).replace(/^\d+\-/, '');
}
