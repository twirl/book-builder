import { describe, it } from 'node:test';

import expect from 'expect';

import { Context } from '../../src/models/Context';
import { CssClasses } from '../../src/models/CssClasses';
import { L10n } from '../../src/models/L10n';
import { ChapterState } from '../../src/models/plugins/ChapterAstPlugin';
import { Strings } from '../../src/models/Strings';
import { Templates } from '../../src/models/Templates';
import { h3Title } from '../../src/plugins/chapterAst/h3Title';
import { markdownToAst } from '../../src/preprocessors/markdown';
import { applyHastPluginToAst } from '../../src/util/applyHastAstPlugin';

const context = {} as any as Context;
const templates = {
    chapterTitle: (
        _path: string,
        _counter: number,
        _context: Context,
        parts: string[]
    ) => parts.join('-'),
    jointTitle: (headers: string[]) => headers.join('-')
} as any as Templates<Strings, CssClasses>;

describe('H3 to title', () => {
    Object.entries({
        'Should leave title as is if there is no h3 tags in the source': {
            md: `#### This is not h3\n\nAnd this is not a **title**`,
            chapter: {
                title: 'Original Title'
            },
            expected: {
                title: 'Original Title'
            }
        },
        'Should convert a single h3 into a title': {
            md: `### This **is** [h3](#link)\n\nAnd this is not a **title**`,
            chapter: {
                title: 'Original Title'
            },
            expected: {
                title: 'This is h3'
            }
        },
        'Should merge all h3 tags found': {
            md: `### This **is** [h3](#link)\n\nAnd this is not a **title**\n\n### And this is again`,
            chapter: {
                title: 'Original Title'
            },
            expected: {
                title: 'This is h3-And this is again'
            }
        }
    }).forEach(([testCase, { md, chapter, expected }]) => {
        it(testCase, async () => {
            const l10n: L10n<Templates<Strings, CssClasses>> = {
                templates,
                strings: {} as any as Strings,
                language: 'en',
                locale: 'en-US'
            };
            const plugin = h3Title<Templates<Strings>, {}>();

            const ast = await markdownToAst(md);
            const state = {
                chapter,
                l10n,
                context
            } as any as ChapterState<Templates<Strings>, {}>;
            await applyHastPluginToAst(ast, plugin, state);

            expect(state.chapter).toEqual(expected);
        });
    });
});
