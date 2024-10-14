import { Root } from 'hast';
import rehypeParse from 'rehype-parse';
import { unified } from 'unified';

export const htmlToAst = async (html: string): Promise<Root> => {
    return unified().use(rehypeParse, { fragment: true }).parse(html) as Root;
};
