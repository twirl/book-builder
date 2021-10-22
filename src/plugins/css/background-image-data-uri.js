import { resolveSrc } from '../../util/resolve-src.js';
import { dataUri } from '../../util/data-uri.js';

export default () =>
    async (rule, declaration, { basePath }) => {
        if (declaration.property == 'background-image') {
            const file = declaration.value.match(/url\((.+)\)/)[1];
            const uri = resolveSrc(file, basePath);

            declaration.value = `url(${await dataUri(uri)})`;
        }
    };
