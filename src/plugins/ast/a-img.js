import { htmlAst } from '../../util/html-ast.js';

export default () =>
    async (p, { data: { templates, l10n } }) => {
        if (p.tagName == 'p' && p.children && p.children.length == 1) {
            const node = p.children[0];
            if (
                node.tagName == 'a' &&
                node.children &&
                node.children.length == 1 &&
                node.children[0].tagName == 'img'
            ) {
                const img = node.children[0];
                const ast = await htmlAst(
                    templates.aImg({
                        href: node.properties.href,
                        src: img.properties.src,
                        alt: img.properties.alt,
                        title: img.properties.title,
                        l10n
                    })
                );
                return ast.children[0];
            }
        }
    };
