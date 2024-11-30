import { resolve } from 'node:path';

import { Href } from '../models/Types';

export const resolveFileSrc = (src: string, base: string): Href => {
    if (src.startsWith('/') && !src.startsWith('//')) {
        return `file://${resolve(base, src.slice(1))}` as Href;
    }
    return src as Href;
};
