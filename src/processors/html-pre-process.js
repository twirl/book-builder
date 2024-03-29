import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

export const htmlPreProcess = async (value, data, plugins = []) => {
    const html = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(createChapterProcessor(plugins))
        .use(rehypeStringify)
        .process({
            value,
            data
        });
    if (data.reference) {
        html += reference;
    }
    return html;
};

const createChapterProcessor = (plugins = []) => {
    return () => async (tree, file, next) => {
        const { templates, counter, l10n } = file.data;

        file.data.anchor = `chapter-${counter}`;
        file.data.titleParts = [];
        file.data.localContext = {};

        tree = await processNode(
            tree,
            file,
            {},
            plugins.map((plugin) => plugin()),
            {
                level: 0
            }
        );

        file.data.title = templates.chapterTitleValue({
            titleParts: file.data.titleParts,
            l10n,
            counter
        });
        const custom = file.data.titleParts.find((t) => Boolean(t.anchor));
        if (custom) {
            file.data.secondaryAnchor = file.data.anchor;
            file.data.anchor = custom.anchor;
        }

        file.data.counter++;
        file.data.localContext = null;

        next(null, tree);
    };
};

const processNode = async (tree, file, context, plugins, { level }) => {
    let cursor = 0;
    while (cursor < tree.children.length) {
        let node = tree.children[cursor];
        for (const plugin of plugins) {
            node = (await plugin(node, file, context)) || node;
            if (node == 'deleted') {
                break;
            }
        }
        tree.children[cursor] = node;
        if (node.children) {
            await processNode(node, file, context, plugins, {
                level: level + 1
            });
        }
        cursor++;
    }

    tree.children = tree.children.filter((node) => node != 'deleted');

    return tree;
};
