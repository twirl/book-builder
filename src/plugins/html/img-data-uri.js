import { dataUri } from '../../util/data-uri.js';
import { resolveSrc } from '../../util/resolve-src.js';

export default () => {
    return async (tree, file, next) => {
        const images = [];
        const imageSearch = (node) => {
            if (
                node.tagName == 'img' ||
                (node.tagName == 'link' && node.properties.rel == 'icon')
            ) {
                images.push(node);
            }
            if (node.children && node.children.length) {
                node.children.forEach(imageSearch);
            }
        };

        imageSearch(tree);
        for (const imageNode of images) {
            const srcProperty = imageNode.tagName == 'img' ? 'src' : 'href';
            imageNode.properties[srcProperty] = await dataUri(
                imageNode.properties[srcProperty]
            );
        }

        next();
    };
};
