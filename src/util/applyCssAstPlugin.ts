import { StyleSheet, CssNode, List, parse } from 'css-tree';

import {
    AstContext,
    AstPluginRunner,
    ReplaceAction
} from '../models/AstPlugin';
import { CssAstPlugin, CssPluginState } from '../models/plugins/CssAstPlugin';

export const applyCssPluginToAst = async <T, S>(
    ast: StyleSheet,
    plugin: CssAstPlugin<T, S>,
    state: CssPluginState<T, S>
): Promise<void> => {
    const runner = await plugin.init(state);
    const updatedChildren: CssNode[] = [];
    const children = ast.children.toArray();
    for (const [index, node] of children.entries()) {
        updatedChildren.push(
            ...(await applyPluginToNode(
                node,
                createContext(ast, children, node, index),
                runner
            ))
        );
    }
    ast.children = new List<CssNode>().fromArray(updatedChildren);
    await runner.finish(state);
};

export const applyPluginToNode = async <T>(
    node: CssNode,
    context: AstContext<CssNode>,
    plugin: AstPluginRunner<T, CssNode>
): Promise<CssNode[]> => {
    const result = await plugin.run(node, context);
    switch (result.action) {
        case 'replace':
            return Array.isArray(result.newValue)
                ? result.newValue
                : [result.newValue];
        case 'continue_nested':
            // if (areChildrenProcessable(node) && node.block !== null) {
            //     const updatedChildren = [];
            //     for (const child of node.block.children.toArray()) {
            //         updatedChildren.push(
            //             ...(await applyPluginToNode(child, plugin))
            //         );
            //     }
            //     node.block.children = new List<CssNode>().fromArray(
            //         updatedChildren
            //     );
            // }
            return [node];
        case 'continue':
        default:
            return [node];
    }
};

export const replaceFromCss = async (
    css: string
): Promise<ReplaceAction<CssNode>> => {
    const stylesheet = parse(css);

    return {
        action: 'replace',
        newValue:
            'children' in stylesheet && stylesheet.children !== null
                ? stylesheet.children.toArray()
                : []
    };
};

export const createContext = (
    parent: StyleSheet,
    children: CssNode[],
    node: CssNode,
    index: number
): AstContext<CssNode> => ({
    index,
    parent: { children },
    previousSibling: index > 0 ? children[index - 1] : null,
    nextSibling: index < children.length - 1 ? children[index + 1] : null
});
