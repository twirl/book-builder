import { describe, it } from 'node:test';

import { expect } from 'expect';
import { ElementContent, Text } from 'hast';

import { Action, AstPlugin } from '../../src/models/AstPlugin';
import { markdownToAst } from '../../src/preprocessors/markdown';
import {
    applyHastPluginToAst,
    isElement,
    replaceFromHtml
} from '../../src/util/applyHastAstPlugin';
import { astToHtml } from '../../src/util/astToHtml';
import { createStatelessPlugin } from '../../src/util/statelessPlugin';

describe('Hast Ast Plugins', () => {
    it('Transforms markdown: alter node and continues nested', async () => {
        const ast = await markdownToAst(`**strong** [ref **strong**](/link2)`);
        await applyHastPluginToAst(
            ast,
            createStatelessPlugin<void, ElementContent>(async (element) => {
                if (
                    element.type === 'element' &&
                    element.tagName === 'strong'
                ) {
                    (element.children[0] as Text).value = 'indeed';
                }
                return { action: 'continue_nested' };
            }),
            undefined
        );
        expect(await astToHtml(ast)).toEqual(
            '<p><strong>indeed</strong> <a href="/link2">ref <strong>indeed</strong></a></p>'
        );
    });

    it('Transforms markdown: preserves plugin state', async () => {
        const ast = await markdownToAst(`**strong** [ref **strong**](/link2)`);
        const state = { elementCounter: 1, nonElementCounter: 0 };
        const pluginClass = class implements AstPlugin<TestState> {
            private elementCounter = 0;
            private nonElementCounter = 0;
            public async init(state: TestState) {
                this.elementCounter = state.elementCounter;
                this.nonElementCounter = state.nonElementCounter;
                return this;
            }
            public async run(input: ElementContent): Promise<Action> {
                if (isElement(input)) {
                    this.elementCounter++;
                } else {
                    this.nonElementCounter++;
                }
                return { action: 'continue_nested' };
            }
            public async finish(state: {
                elementCounter: number;
                nonElementCounter: number;
            }) {
                state.elementCounter = this.elementCounter;
                state.nonElementCounter = this.nonElementCounter;
            }
        };
        await applyHastPluginToAst(ast, new pluginClass(), state);
        expect(state.elementCounter).toEqual(5);
        expect(state.nonElementCounter).toEqual(4);
    });

    it('Transforms markdown: alter node and continue', async () => {
        const ast = await markdownToAst(`**strong** [ref **strong**](/link2)`);
        await applyHastPluginToAst(
            ast,
            createStatelessPlugin(async (element) => {
                if (element.type === 'element') {
                    if (element.properties.href === '/link2') {
                        element.properties.href = '/link3';
                        return { action: 'continue' };
                    }
                    if (element.tagName === 'strong') {
                        (element.children[0] as Text).value = 'indeed';
                    }
                }
                return { action: 'continue_nested' };
            }),
            null
        );
        expect(await astToHtml(ast)).toEqual(
            '<p><strong>indeed</strong> <a href="/link3">ref <strong>strong</strong></a></p>'
        );
    });

    it('Transforms markdown: delete a node', async () => {
        const ast = await markdownToAst(`**strong** [ref **strong**](/link2)`);
        await applyHastPluginToAst(
            ast,
            createStatelessPlugin(async (element) => {
                if (
                    element.type === 'element' &&
                    element.tagName === 'strong'
                ) {
                    return { action: 'replace', newValue: [] };
                }
                return { action: 'continue_nested' };
            }),
            null
        );
        expect(await astToHtml(ast)).toEqual(
            '<p> <a href="/link2">ref </a></p>'
        );
    });

    it('Transforms markdown: replace a node', async () => {
        const ast = await markdownToAst(`**strong** [ref **strong**](/link2)`);
        await applyHastPluginToAst(
            ast,
            createStatelessPlugin(async (element: ElementContent) => {
                if (element.type === 'element') {
                    if (element.tagName === 'a') {
                        return replaceFromHtml('<strong>strong</strong>');
                    }
                    if (element.tagName === 'strong') {
                        return replaceFromHtml('<em>em</em><br/>');
                    }
                }
                return { action: 'continue_nested' };
            }),
            null
        );
        expect(await astToHtml(ast)).toEqual(
            '<p><em>em</em><br /> <strong>strong</strong></p>'
        );
    });
});

interface TestState {
    elementCounter: number;
    nonElementCounter: number;
}
