import { htmlAst } from '../../util/html-ast.js';

export default () =>
    async (node, { data }) => {
        if (
            node.tagName == 'a' &&
            node.children &&
            node.children.length == 1 &&
            node.children[0].type == 'text'
        ) {
            const ref = (node.children[0].value || '').slice(0, 4);
            const href = node.properties.href;
            if (!data.refCounter) {
                data.refCounter = 0;
            }
            if (!data.references) {
                data.references = [];
            }

            if (ref == 'ref:') {
                data.refCounter++;
                const text = node.children[0].value.slice(4).trim();
                const anchor = `${data.anchor}-ref-${data.refCounter}`;
                const backAnchor = `${anchor}-back`;

                node.properties.href = '#' + anchor;
                node.properties.name = backAnchor;
                node.properties.className = ['ref'];

                node.children = (
                    await htmlAst(
                        data.templates.reference({
                            counter: data.refCounter
                        })
                    )
                ).children;

                data.references.push({
                    counter: data.refCounter,
                    text,
                    href,
                    anchor,
                    backAnchor
                });
            }
        }
    };
