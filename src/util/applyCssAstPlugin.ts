import { StyleSheet, CssNode, List, parse } from 'css-tree';

import { AstPluginRunner, ReplaceAction } from '../models/AstPlugin';
import { CssAstPlugin, CssPluginState } from '../models/plugins/CssAstPlugin';

export const applyCssPluginToAst = async <T, S>(
    ast: StyleSheet,
    plugin: CssAstPlugin<T, S>,
    state: CssPluginState<T, S>
): Promise<void> => {
    const runner = await plugin.init(state);
    const updatedChildren: CssNode[] = [];
    for (const node of ast.children) {
        updatedChildren.push(...(await applyPluginToNode(node, runner)));
    }
    ast.children = new List<CssNode>().fromArray(updatedChildren);
    await runner.finish(state);
};

export const applyPluginToNode = async <T>(
    node: CssNode,
    plugin: AstPluginRunner<T, CssNode>
): Promise<CssNode[]> => {
    const result = await plugin.run(node);
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

// export const areChildrenProcessable = function (node: CssNode): node is ? {
//     return node.type === ?;
// };
