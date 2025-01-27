import { describe, it } from 'node:test';

import expect from 'expect';

import { StructureAstState } from '../../src/models/plugins/StructureAstPlugin';
import { BibliographyItemAlias, Reference } from '../../src/models/Reference';
import { Href } from '../../src/models/Types';
import { ref } from '../../src/plugins/structureAst';
import { RefAstPluginRunner } from '../../src/plugins/structureAst/ref';
import { markdownToAst } from '../../src/preprocessors/markdown';
import { applyHastPluginToAst } from '../../src/util/applyHastAstPlugin';
import { astToHtml } from '../../src/util/astToHtml';

describe('matchReferenceContent', () => {
    async function expectMatches(
        text: string,
        href: Href | undefined,
        expected: Omit<Reference, 'counter'>
    ) {
        const plugin = ref({ prefix: 'ref' });
        const runner = (await plugin.init({} as any)) as RefAstPluginRunner<
            any,
            any
        >;
        expect(runner.matchReferenceContent(100, text, href)).toEqual({
            ...expected,
            counter: 100,
            href
        });
    }

    Object.entries({
        'without href': undefined,
        'with href': 'https://href' as Href
    }).forEach(([testCase, href]) => {
        describe(testCase, () => {
            it('Matches simple ref', async () => {
                await expectMatches('ref text', href, {
                    text: 'text'
                });
            });

            it('Matches ref with alias', async () => {
                await expectMatches('ref:an-alias text', href, {
                    bibliographyItemAlias: 'an-alias' as BibliographyItemAlias,
                    text: 'text'
                });
            });

            it('Matches simple ref with alt', async () => {
                await expectMatches('ref text|ref alt-text', href, {
                    text: 'text',
                    alt: {
                        text: 'alt-text'
                    }
                });
            });

            it('Matches simple ref with alt alias', async () => {
                await expectMatches('ref text|ref:alt-alias alt-text', href, {
                    text: 'text',
                    alt: {
                        bibliographyItemAlias:
                            'alt-alias' as BibliographyItemAlias,
                        text: 'alt-text'
                    }
                });
            });
        });
    });
});

describe('Processing references', () => {
    it('Correctly processes successive refs', async () => {
        const ast = await markdownToAst(
            'bla-bla[prefix:alias refText]()[prefix refText]() bla-bla [prefix Another ref](/href)'
        );
        const state = {
            l10n: {
                templates: {
                    htmlInPlaceReference: (
                        ref: Reference,
                        chapter: any,
                        section: any,
                        isSuccessiveRefs: boolean
                    ) =>
                        isSuccessiveRefs
                            ? '<a>successive ref</a>'
                            : '<a>normal ref'
                }
            }
        } as StructureAstState<any, any>;
        const plugin = ref({ prefix: 'prefix' });
        await applyHastPluginToAst(ast, plugin, state);
        expect(await astToHtml(ast)).toEqual(
            '<p>bla-bla<a>normal ref</a><a>successive ref</a> bla-bla <a>normal ref</a></p>'
        );
    });
});
