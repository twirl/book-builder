import { Element, ElementContent, Root, RootContent, Text } from 'hast';

import {
    AstContext,
    AstPlugin,
    AstPluginRunner,
    ReplaceAction
} from '../models/AstPlugin';
import { htmlToAst } from '../preprocessors/html';

export const applyHastPluginToAst = async <T>(
    ast: Root,
    plugin: AstPlugin<T, ElementContent>,
    state: T
): Promise<AstPluginRunner<T, ElementContent>> => {
    const runner = await plugin.init(state);
    const updatedChildren: RootContent[] = [];
    for (const [index, node] of ast.children.entries()) {
        if (isElement(node) || isTextNode(node)) {
            updatedChildren.push(
                ...(await applyPluginToNode(
                    node,
                    makeAstContext(ast, index),
                    runner
                ))
            );
        } else {
            updatedChildren.push(node);
        }
    }
    ast.children = updatedChildren;
    await runner.finish(state);
    return runner;
};

export const makeAstContext = (
    ast: Root | Element,
    index: number
): AstContext<ElementContent> => {
    const prev = ast.children[index - 1] ?? null;
    const next = ast.children[index + 1] ?? null;

    return {
        index,
        previousSibling: prev && isElementContent(prev) ? prev : null,
        nextSibling: next && isElementContent(next) ? next : null
    };
};

export const applyPluginToNode = async <State>(
    node: Element | Text,
    context: AstContext,
    plugin: AstPluginRunner<State, ElementContent>
): Promise<ElementContent[]> => {
    const result = await plugin.run(node, context);
    const updatedChildren: ElementContent[] = [];
    switch (result.action) {
        case 'replace':
            return Array.isArray(result.newValue)
                ? result.newValue
                : [result.newValue];
        case 'continue':
            return [node];
        case 'continue_nested':
        default:
            if (!isElement(node)) {
                return [node];
            }
            for (const [index, childNode] of node.children.entries()) {
                if (isElement(childNode) || isTextNode(childNode)) {
                    updatedChildren.push(
                        ...(await applyPluginToNode(
                            childNode,
                            makeAstContext(node, index),
                            plugin
                        ))
                    );
                } else {
                    updatedChildren.push(childNode);
                }
            }
            node.children = updatedChildren;
            return [node];
    }
};

export const isElement = (node: RootContent): node is Element =>
    node.type === 'element';

export const isTextNode = (node: RootContent): node is Text =>
    node.type === 'text';

export const isElementContent = (node: RootContent): node is ElementContent =>
    ['element', 'text', 'comment'].includes(node.type);

export const replaceFromHtml = async (
    html: string
): Promise<ReplaceAction> => ({
    action: 'replace',
    newValue: (await htmlToAst(html)).children as ElementContent[]
});
