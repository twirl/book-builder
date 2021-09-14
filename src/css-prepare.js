import { readFileSync } from 'fs';
import { resolve } from 'path';
import { cssProcess } from './processors/css.js';

export const cssPrepare = async (
    target,
    options,
    { beforeAll = [], common = [], screen = [], print = [], afterAll = [] }
) => {
    const { basePath } = options;
    const css = readFileSync(resolve(basePath, 'css/style.css'), 'utf-8');
    const mediaCss = readFileSync(
        resolve(basePath, target == 'pdf' ? 'css/print.css' : 'css/screen.css'),
        'utf-8'
    );
    return `${await cssProcess(css, options, [
        ...beforeAll,
        ...common,
        ...afterAll
    ])}\n${await cssProcess(mediaCss, options, [
        ...beforeAll,
        ...(target == 'pdf' ? print : screen),
        ...afterAll
    ])}`;
};
