import { describe, it } from 'node:test';

import expect from 'expect';

import { htmlToAst } from '../../src/preprocessors/html';

describe('HTML Preprocessor', () => {
    it('Should parse HTML into AST', async () => {
        const doc = await htmlToAst(`text <a href="#link">ref</a>`);
        console.log(JSON.stringify(doc, null, 4));
        expect(doc).toEqual({
            type: 'root',
            children: [
                {
                    type: 'text',
                    value: 'text ',
                    position: expect.anything()
                },
                {
                    type: 'element',
                    tagName: 'a',
                    properties: {
                        href: '#link'
                    },
                    children: [
                        {
                            type: 'text',
                            value: 'ref',
                            position: expect.anything()
                        }
                    ],
                    position: expect.anything()
                }
            ],
            data: expect.anything(),
            position: expect.anything()
        });
    });
});
