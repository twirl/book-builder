export default () =>
    async (node, { data }) => {
        if (node.type == 'text') {
            if (!data.stat) {
                data.stat = {
                    words: 0,
                    characters: 0
                };
            }
            const words = node.value.split(/\s+/);
            data.stat.words += words.length;
            data.stat.characters += words.reduce((s, w) => s + w.length, 0);
        }
    };
