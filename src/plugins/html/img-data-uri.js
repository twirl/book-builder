import { dataUri } from '../../util/data-uri.js';

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
            imageNode.properties.src = await dataUri(imageNode.properties.src);
        }

        next();
    };
};
