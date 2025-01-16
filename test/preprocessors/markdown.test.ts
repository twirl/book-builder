import { describe, it } from 'node:test';

import { expect } from 'expect';

import { markdownToAst } from '../../src/preprocessors/markdown';

describe('markdownAst', () => {
    it('parse markdown', async () => {
        const doc = await markdownToAst(`text [ref](#link)`);
        expect(doc).toEqual({
            type: 'root',
            children: [
                {
                    type: 'element',
                    tagName: 'p',
                    properties: {},
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
                    position: expect.anything()
                }
            ],
            position: expect.anything()
        });
    });
});
