import { resolve } from 'path';

const resolveSrc = (base, src) => {
    return src.indexOf('/') == 0 ? resolve(base, src.slice(1)) : src;
};

export default () =>
    async (node, { data: { base } }) => {
        if (node.tagName && node.tagName == 'img') {
            node.properties.src = resolveSrc(base, node.properties.src);
        }
    };
