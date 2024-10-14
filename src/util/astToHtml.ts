import { Element, Root } from 'hast';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';

export const astToHtml = async (ast: Root): Promise<string> => {
    return unified()
        .use(rehypeStringify, {
            closeSelfClosing: true
        })
        .stringify(ast);
};

export const astNodeToHtml = async (ast: Element): Promise<string> => {
    return unified()
        .use(rehypeStringify, {
            closeSelfClosing: true
        })
        .stringify({
            type: 'root',
            children: [ast]
        });
};
