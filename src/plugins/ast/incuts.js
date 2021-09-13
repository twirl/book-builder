export default (incuts) => {
    return () =>
        async (node, { data: { l10n } }) => {
            if (
                node.tagName == 'p' &&
                node.children.length &&
                node.children[0].type == 'text'
            ) {
                const incut = Object.entries(incuts).reduce(
                    (incut, [type, signature]) => {
                        return (
                            incut ||
                            (node.children[0].value.indexOf(signature) == 0
                                ? type
                                : false)
                        );
                    },
                    false
                );
                if (incut) {
                    node.children[0].value = node.children[0].value.slice(
                        incuts[incut].length
                    );
                    return {
                        type: 'element',
                        tagName: 'div',
                        properties: {
                            className: [incut]
                        },
                        children: [
                            {
                                type: 'element',
                                tagName: 'h5',
                                children: [
                                    {
                                        type: 'text',
                                        value: l10n[incut]
                                    }
                                ],
                                position: node.position
                            },
                            node
                        ],
                        position: node.position
                    };
                }
            }
        };
};
