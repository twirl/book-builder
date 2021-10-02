import htmlValidator from 'html-validator';
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';

export const htmlAst = async (value) => {
    const result = await htmlValidator({
        data: value,
        validator: 'WHATWG',
        isFragment: true,
        ignore: ['heading-level']
    });
    if (result.errors.length) {
        throw new Error(
            `Wrong HTML template: ${value}\nValidation errors: ${JSON.stringify(
                result.errors,
                null,
                4
            )}`
        );
    }
    const ast = await unified().use(rehypeParse).parse(`<html>${value}</html>`);
    return ast.children
        .find(({ tagName }) => tagName == 'html')
        .children.find(({ tagName }) => tagName == 'body');
};
