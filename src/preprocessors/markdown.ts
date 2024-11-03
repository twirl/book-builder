import { Root } from 'hast';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

import { AstPlugin } from '../models/AstPlugin';
import { applyHastPluginToAst } from '../util/applyHastAstPlugin';

export const preprocessMarkdown = async <T>(
    md: string,
    plugins: AstPlugin<T>[] = [],
    state: T
) => {
    const ast = await markdownToAst(md);

    for (const plugin of plugins) {
        await applyHastPluginToAst(ast, plugin, state);
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
