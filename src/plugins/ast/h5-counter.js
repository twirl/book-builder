export default () =>
    async (node, { data: { templates, counter } }, context) => {
        if (node.tagName == 'h5') {
            let value = node.children[0].value.trim();
            let number;

            if (!context.h5counter) {
                context.h5counter = 0;
            }

            const match = value.match(/^(\d+)\.\s*/);
            if (!match) {
                number = ++context.h5counter;
            } else {
                number = Number(match[1]);
                value = value.slice(match[0].length);
                context.h5counter++;
            }
            value = templates.h5Value({
                value,
                number
            });
            const anchor = `chapter-${counter}-paragraph-${context.h5counter}`;

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
