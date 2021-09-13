import { resolve } from 'path';
import datauri from 'datauri';

export default () =>
    async (rule, declaration, { basePath }) => {
        if (declaration.property == 'background-image') {
            const file = declaration.value.match(/url\((.+)\)/)[1].slice(1);
            const uri = await datauri(resolve(basePath, file));
            declaration.value = `url(${uri})`;
        }
    };
