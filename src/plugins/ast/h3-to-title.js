export default () =>
    async (node, { data: { titleParts } }) => {
        if (node.tagName == 'h3') {
            const value = node.children[0].value.trim();
            const match = value.match(/^\[(.+)\]\[(.+)\]$/);
            titleParts.push(
                match
                    ? {
                          title: match[1],
                          anchor: match[2]
                      }
                    : {
                          title: node.children[0].value
                      }
            );
            return 'deleted';
        }
    };
