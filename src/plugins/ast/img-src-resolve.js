import { resolveSrc } from '../../util/resolve-src.js';

export default () =>
    async (node, { data: { base } }) => {
        if (node.tagName && node.tagName == 'img') {
            node.properties.src = resolveSrc(node.properties.src, base);
        }
    };
