import { htmlAst } from '../../util/html-ast.js';

export default () =>
    async (node, { data }) => {
        if (
            node.tagName == 'a' &&
            node.children &&
            node.children.length == 1 &&
            node.children[0].type == 'text'
        ) {
            const ref = (node.children[0].value || '').slice(0, 4).trim();
            const href = node.properties.href;

            if (!data.refCounter) {
                data.refCounter = 0;
            }
            if (!data.localContext.refCounter) {
                data.localContext.refCounter = 0;
            }
            if (!data.references) {
                data.references = [];
            }

            if (ref == 'ref' || ref == 'ref:') {
                data.refCounter++;
                data.localContext.refCounter++;
                const value = node.children[0].value.slice(4).trim();
                const match = value.match(/^(.+):([\d,-\s]+|".+")$/);
                const page = match && match[2];
                const text = ref == 'ref' ? (match && match[1]) || value : null;
                const alias =
                    ref == 'ref:' ? (match && match[1]) || value : null;
                const anchor = `${data.anchor}-ref-${data.refCounter}`;
                const backAnchor = `${anchor}-back`;

                node.properties.href = '#' + anchor;
                node.properties.name = backAnchor;
                node.properties.className = ['ref'];
                node.children = (
                    await htmlAst(
                        data.templates.reference({
                            counter: data.refCounter,
                            localCounter: data.localContext.refCounter
                        })
                    )
                ).children;

                data.references.push({
                    counter: data.refCounter,
                    localCounter: data.localContext.refCounter,
                    text,
                    alias,
                    href,
                    anchor,
                    page,
                    backAnchor
                });
            }
        }
    };
