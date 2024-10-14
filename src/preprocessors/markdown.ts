import { Root, Element, RootContent, ElementContent } from 'hast';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import { AstPlugin } from '../models/plugins/AstPlugin';
import { applyPluginToAst } from '../util/applyAstPlugin';

export const preprocessMarkdown = async <T>(
    md: string,
    plugins: AstPlugin<T>[] = [],
    state: T
) => {
    const ast = await markdownToAst(md);

    for (const plugin of plugins) {
        await applyPluginToAst(ast, plugin, state);
    }
};

export const markdownToAst = async (md: string): Promise<Root> => {
    const processor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype);

    const mdAst = processor.parse(md);

    return processor.run(mdAst) as Promise<Root>;
};
