import { describe, it } from 'node:test';

import { CssNode, generate, parse, StyleSheet } from 'css-tree';
import { expect } from 'expect';

import { Context } from '../../src/models/Context';
import { L10n } from '../../src/models/L10n';
import {
    CssAstPlugin,
    CssPluginState
} from '../../src/models/plugins/CssAstPlugin';
import { applyCssPluginToAst } from '../../src/util/applyCssAstPlugin';
import { createStatelessPlugin } from '../../src/util/statelessPlugin';

const CSS = `p, div { display: none; }
             #id { border: transparent none; }`;

const EXTRA_TEMPLATES = {
    test: () => 'test'
} as const;
const EXTRA_STRINGS = {
    test: 'test'
} as const;

type TestPluginState = CssPluginState<
    typeof EXTRA_TEMPLATES,
    typeof EXTRA_STRINGS
>;
type TestPlugin = CssAstPlugin<typeof EXTRA_TEMPLATES, typeof EXTRA_STRINGS>;
const STATE: TestPluginState = {
    l10n: {
        strings: EXTRA_STRINGS,
        templates: EXTRA_TEMPLATES
    } as any as L10n<typeof EXTRA_TEMPLATES, typeof EXTRA_STRINGS>,
    context: {} as any as Context
};

describe('CSS Ast Plugins', () => {
    it('Transforms css: alter node and continues nested', async () => {
        const ast = parse(CSS);
        assertIsStylesheet(ast);
        const plugin: TestPlugin = createStatelessPlugin<
            'css_ast_plugin',
            TestPluginState,
            CssNode
        >('css_ast_plugin', async (node) => {
            if (node.type === 'Rule') {
                const first = node.block.children.first;
                if (first?.type === 'Declaration') {
                    first.property = 'color';
                }
            }
            return { action: 'continue_nested' };
        });
        await applyCssPluginToAst(ast, plugin, STATE);
        expect(generate(ast)).toEqual(
            'p,div{color:none}#id{color:transparent none}'
        );
    });
});

function assertIsStylesheet(ast: CssNode): asserts ast is StyleSheet {
    expect(ast.type).toEqual('StyleSheet');
}
