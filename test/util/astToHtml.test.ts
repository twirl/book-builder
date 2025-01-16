import { describe, it } from 'node:test';

import expect from 'expect';
import { Element } from 'hast';

import { markdownToAst } from '../../src/preprocessors/markdown';
import { astNodeToHtml, astToHtml } from '../../src/util/astToHtml';

describe('util.astToHtml', () => {
    it('astToHtml', async () => {
        const ast = await markdownToAst('**strong** [ref](#link)');
        const html = await astToHtml(ast);
        expect(html).toEqual(
            '<p><strong>strong</strong> <a href="#link">ref</a></p>'
        );
    });
    it('astNodeToHtml', async () => {
        const ast = await markdownToAst('**strong** [ref](#link)');
        const html = await astNodeToHtml(ast.children[0] as Element);
        expect(html).toEqual(
            '<p><strong>strong</strong> <a href="#link">ref</a></p>'
        );
    });
});
