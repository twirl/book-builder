import { htmlAst } from '../../util/html-ast.js';

export default () =>
    async (node, { data: { templates, l10n } }) => {
        if (
            node.tagName == 'a' &&
            node.children &&
            node.children.length == 1 &&
            node.children[0].tagName == 'img'
        ) {
            const img = node.children[0];
            return htmlAst(
                templates.aImg({
                    href: node.properties.href,
                    src: img.properties.src,
                    alt: img.properties.alt,
                    title: img.properties.title,
                    l10n
                })
            );
        }
    };
