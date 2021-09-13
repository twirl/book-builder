import { readFileSync } from 'fs';
import { resolve } from 'path';
import { cssProcess } from './processors/css.js';

export const cssPrepare = async (
    target,
    {
        basePath,
        plugins: {
            beforeAll = [],
            common = [],
            screen = [],
            print = [],
            afterAll = []
        }
    }
) => {
    const css = readFileSync(resolve(basePath, 'css/style.css'), 'utf-8');
    const mediaCss = readFileSync(
        resolve(basePath, target == 'pdf' ? 'css/print.css' : 'css/screen.css'),
        'utf-8'
    );
    return `${await cssProcess(css, {
        basePath,
        plugins: [...beforeAll, ...common, ...afterAll]
    })}\n${await cssProcess(mediaCss, {
        basePath,
        plugins: [
            ...beforeAll,
            ...(target == 'pdf' ? print : screen),
            ...afterAll
        ]
    })}`;
};
