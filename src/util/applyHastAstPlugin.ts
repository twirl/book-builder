import { Element, ElementContent, Root, RootContent } from 'hast';

import { AstPlugin, AstPluginRunner, ReplaceAction } from '../models/AstPlugin';
import { htmlToAst } from '../preprocessors/html';

export const applyHastPluginToAst = async <T>(
    ast: Root,
    plugin: AstPlugin<T, ElementContent>,
    state: T
): Promise<AstPluginRunner<T, ElementContent>> => {
    const runner = await plugin.init(state);
    const updatedChildren: RootContent[] = [];
    for (const node of ast.children) {
        if (isElement(node)) {
            updatedChildren.push(...(await applyPluginToNode(node, runner)));
        } else {
            updatedChildren.push(node);
        }
    }
    ast.children = updatedChildren;
    await runner.finish(state);
    return runner;
};

export const applyPluginToNode = async <State>(
    node: Element,
    plugin: AstPluginRunner<State, ElementContent>
): Promise<ElementContent[]> => {
    const result = await plugin.run(node);
    switch (result.action) {
        case 'replace':
            return Array.isArray(result.newValue)
                ? result.newValue
                : [result.newValue];
        case 'continue':
            return [node];
        case 'continue_nested':
        default:
            const updatedChildren: ElementContent[] = [];
            for (const childNode of node.children) {
                if (isElement(childNode)) {
                    updatedChildren.push(
                        ...(await applyPluginToNode(childNode, plugin))
                    );
                } else {
                    updatedChildren.push(childNode);
                }
            }
            node.children = updatedChildren;
            return [node];
    }
};

export const isElement = (node: RootContent): node is Element => {
    return node.type === 'element';
};

export const replaceFromHtml = async (html: string): Promise<ReplaceAction> => {
    return {
        action: 'replace',
        newValue: (await htmlToAst(html)).children as ElementContent[]
    };
};
