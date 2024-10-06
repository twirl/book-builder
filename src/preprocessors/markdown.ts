import { Parent, Node, Root } from 'hast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import { ActionType, AstPlugin } from '../models/AstPlugin';

export const preprocessMarkdown = async (
    md: string,
    plugins: AstPlugin<any>[] = []
) => {
    const ast = await markdownToAst(md);

    for (const plugin of plugins) {
        await applyPluginToAst(ast, plugin);
    }
};

export const markdownToAst = async (md: string): Promise<Root> => {
    return unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .parse(md) as Root;
};

export const applyPluginToAst = async (
    ast: Root,
    plugin: AstPlugin<any>
): Promise<void> => {
    const state = plugin.init();

    for (const [index, node] of ast.children.entries()) {
        await applyPluginToNode(plugin, node, ast, index, state);
    }
};

export const applyPluginToNode = async <T>(
    plugin: AstPlugin<T>,
    node: Node,
    parent: Parent,
    index: number,
    state: T
) => {
    const result = await plugin.run(node, state);
    switch (result.action) {
        case ActionType.REPLACE:
            (parent.children as Node[]).splice(index, 0, result.newValue);
            return;
        case ActionType.CONTINUE:
        default:
            if (isParentNode(node)) {
                for (const [index, subNode] of node.children.entries()) {
                    await applyPluginToNode(
                        plugin,
                        subNode,
                        node,
                        index,
                        state
                    );
                }
            }
    }
};

export const isParentNode = (node: Node): node is Parent => {
    return 'children' in node;
};

// export const createChapterProcessor = (
//     plugins = []
// ): AstPlugin<Parameters, Input, Output> => {
//     return () => async (tree, file, next) => {
//         const { templates, counter, l10n, fileName } = file.data;

//         file.data.anchor = fileName
//             .toLowerCase()
//             .replace(/^\d+\-/, '')
//             .replace(/\.\w+$/, '');
//         file.data.titleParts = [];
//         file.data.localContext = {};

//         tree = await processNode(
//             tree,
//             file,
//             {},
//             plugins.map((plugin) => plugin()),
//             {
//                 level: 0
//             }
//         );

//         file.data.title = templates.chapterTitleValue({
//             titleParts: file.data.titleParts,
//             l10n,
//             counter
//         });

//         file.data.counter++;
//         file.data.localContext = null;

//         next(null, tree);
//     };
// };

// const processNode = async (tree, file, context, plugins, { level }) => {
//     let cursor = 0;
//     while (cursor < tree.children.length) {
//         let node = tree.children[cursor];
//         for (const plugin of plugins) {
//             node = (await plugin(node, file, context)) || node;
//             if (node == 'deleted') {
//                 break;
//             }
//         }
//         tree.children[cursor] = node;
//         if (node.children) {
//             await processNode(node, file, context, plugins, {
//                 level: level + 1
//             });
//         }
//         cursor++;
//     }

//     tree.children = tree.children.filter((node) => node != 'deleted');

//     return tree;
// };
