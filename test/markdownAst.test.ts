import { describe, it } from 'node:test';

import { markdownToAst } from '../src/preprocessors/markdown';

describe('markdownAst', () => {
    it('test', async () => {
        const result = await markdownToAst(`
            ### Header

            Text.
        `);
        console.log(JSON.stringify(result, null, 4));
    });
});
