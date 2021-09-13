export default () =>
    async (node, { data: { titleParts } }) => {
        if (node.tagName == 'h3') {
            titleParts.push(node.children[0].value);
            return 'deleted';
        }
    };
