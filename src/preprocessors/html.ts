import { Element, Root } from 'hast';
import rehypeParse from 'rehype-parse';
import { unified } from 'unified';

import { isElement } from '../util/applyHastAstPlugin';

export const htmlToAst = async (html: string): Promise<Root> => unified().use(rehypeParse, { fragment: true }).parse(html) as Root;

export const htmlToAstElements = async (html: string): Promise<Element[]> => (await htmlToAst(html)).children.filter((el) => isElement(el));
