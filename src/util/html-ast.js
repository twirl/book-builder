import { unified } from 'unified';
import rehypeParse from 'rehype-parse';

export const htmlAst = async (value) => {
    const ast = await unified().use(rehypeParse).parse(`<html>${value}</html>`);
    return ast.children
        .find(({ tagName }) => tagName == 'html')
        .children.find(({ tagName }) => tagName == 'body');
};
