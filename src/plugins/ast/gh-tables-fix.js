export default () =>
    async (node, { data: { templates } }) => {
        if (node.tagName && node.tagName == 'th') {
            if (!node.properties) {
                node.properties = {};
            }
            if (!node.properties.scope) {
                node.properties.scope = 'col';
            }
        }
        if (node.tagName && (node.tagName == 'td' || node.tagName == 'th')) {
            const align = node.properties.align;
            if (align) {
                if (templates.alignClassName) {
                    node.properties.className =
                        (node.properties.className
                            ? node.properties.className + ' '
                            : '') + templates.alignClassName(align);
                } else {
                    node.properties.style =
                        (node.properties.style || '') + `text-align:${align};`;
                }
                delete node.properties.align;
            }
        }
    };
