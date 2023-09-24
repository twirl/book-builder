import { cssProcess } from './processors/css.js';

export const cssPrepare = async (
    rawCss,
    options,
    { beforeAll = [], common = [], afterAll = [] },
    extra
) => {
    const css = rawCss.join('\n\n');
    return (
        (await cssProcess(css, options, [
            ...beforeAll,
            ...common,
            ...afterAll
        ])) + (extra ? '\n' + extra : '')
    );
};
