import datauri from 'datauri';

export default () => {
    return async (tree, file, next) => {
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

        for (const imageNode of images) {
            const dataUri = await datauri(imageNode.properties.src);
            imageNode.properties.src = dataUri;
        }

        next();
    };
};
