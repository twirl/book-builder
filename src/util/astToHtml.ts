import { Element, Root } from 'hast';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';

import { HtmlString } from '../models/Types';

export const astToHtml = async (ast: Root): Promise<HtmlString> => unified()
        .use(rehypeStringify, {
            closeSelfClosing: true
        })
        .stringify(ast) as HtmlString;

export const astNodeToHtml = async (ast: Element): Promise<HtmlString> => unified()
        .use(rehypeStringify, {
            closeSelfClosing: true
        })
        .stringify({
            type: 'root',
            children: [ast]
        }) as HtmlString;
