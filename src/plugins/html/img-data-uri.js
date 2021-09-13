import datauri from 'datauri';

export default () => {
    return (tree, file, next) => {
        const images = [];
        const imageSearch = (node) => {
            if (node.tagName == 'img') {
                images.push(node);
            }
            if (node.children && node.children.length) {
                node.children.forEach(imageSearch);
            }
        };

        imageSearch(tree);

        Promise.all(
            images.map((imageNode) => {
                const src = imageNode.properties.src;
                return datauri(src).then((src) => {
                    imageNode.properties.src = src;
                });
            })
        ).then(() => {
            next();
        });
    };
};
