export default () =>
    async (node, { data: { templates, counter } }, context) => {
        if (node.tagName == 'h5') {
            let value = node.children[0].value;
            let number;

            if (!context.h5counter) {
                context.h5counter = 0;
            }

            const match = value.match(/^\d+/);
            if (!match) {
                number = ++context.h5counter;
            } else {
                number = match[0];
            }
            value = templates.h5Value({
                value,
                number
            });
            const anchor = `chapter-${counter}-paragraph-${number}`;

            node.children[0] = {
                type: 'element',
                tagName: 'a',
                properties: {
                    href: '#' + anchor,
                    id: anchor,
                    className: ['anchor']
                },
                children: [
                    {
                        type: 'text',
                        value
                    }
                ],
                position: node.children[0].position
            };
        }
    };
