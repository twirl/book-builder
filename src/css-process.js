const path = require('path');
const fs = require('fs');

const imageDataUri = require('image-data-uri');
const reworkCss = require('css');

module.exports = (css, { basePath }) => {
    const ast = reworkCss.parse(css);

    (ast.stylesheet.rules || []).forEach((rule) => {
        (rule.declarations || []).forEach((declaration) => {
            if (declaration.property == 'background-image') {
                const file = declaration.value.match(/url\((.+)\)/)[1].slice(1);
                const data = fs.readFileSync(path.resolve(basePath, file));
                const uri = imageDataUri.encode(data, 'image/png');
                declaration.value = `url(${uri})`;
            }
        });
    });

    return reworkCss.stringify(ast);
};
