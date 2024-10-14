import { describe, it } from 'node:test';

import expect from 'expect';

import { Context } from '../../src/models/Context';
import { ChapterState } from '../../src/models/plugins/AstPlugin';
import { Templates } from '../../src/models/Templates';
import { H3TitlePlugin } from '../../src/plugins/chapterAst/h3Title';
import { htmlToAst } from '../../src/preprocessors/html';
import { markdownToAst } from '../../src/preprocessors/markdown';
import { applyPluginToAst } from '../../src/util/applyAstPlugin';

const context = {} as any as Context;
const templates = {
    chapterTitle: (
        _path: string,
        _counter: number,
        _context: Context,
        parts: string[]
    ) => parts.join('-')
} as any as Templates;

describe('H3 to title', () => {
    Object.entries({
        'Should leave title as is if there is no h3 tags in the source': {
            md: `#### This is not h3\n\nAnd this is not a **title**`,
            state: {
                title: 'Original Title'
            },
            expected: {
                title: 'Original Title'
            }
        },
        'Should convert a single h3 into a title': {
            md: `### This **is** [h3](#link)\n\nAnd this is not a **title**`,
            state: {
                title: 'Original Title'
            },
            expected: {
                title: 'This is h3'
            }
        },
        'Should merge all h3 tags found': {
            md: `### This **is** [h3](#link)\n\nAnd this is not a **title**\n\n### And this is again`,
            state: {
                title: 'Original Title'
            },
            expected: {
                title: 'This is h3-And this is again'
            }
        }
    }).forEach(([testCase, { md, state, expected }]) => {
        it(testCase, async () => {
            const plugin = new H3TitlePlugin(templates, context);

            const ast = await markdownToAst(md);

            await applyPluginToAst(ast, plugin, state as any as ChapterState);

            expect(state).toEqual(expected);
        });
    });
});
