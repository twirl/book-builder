const path = require('path');

const unified = require('unified');
const remarkParse = require('remark-parse');
const remarkRehype = require('remark-rehype');
const rehypeStringify = require('rehype-stringify');

const resolveSrc = (base, src) => {
    return src.indexOf('/') == 0 ? path.resolve(base, src.slice(1)) : src;
};

const chapterProcessor = () => {
    return (tree, file) => {
        const counter = file.data.counter;
        const l10n = file.data.l10n;
        const templates = file.data.templates;

        file.data.anchor = file.data.anchor = `chapter-${counter}`;
        const titles = [];

        const imageProcess = function (node, parent, index) {
            let processChildren = node.children && node.children.length;
            if (
                node.tagName == 'a' &&
                node.children &&
                node.children.length == 1 &&
                node.children[0].tagName == 'img'
            ) {
                const img = node.children[0];
                parent.children.splice(
                    index,
                    1,
                    templates.imgLinkTree({
                        href: node.properties.href,
                        src: resolveSrc(file.data.base, img.properties.src),
                        alt: img.properties.alt,
                        title: img.properties.title,
                        position: node.position
                    })
                );
                processChildren = false;
            } else if (node.tagName == 'img') {
                node.properties.src = resolveSrc(
                    file.data.base,
                    node.properties.src
                );
                processChildren = false;
            }
            if (processChildren) {
                node.children.forEach((child, index) =>
                    imageProcess(child, node, index)
                );
            }
        };

        let h5counter = 0;
        tree.children.slice().forEach((node, index) => {
            switch (node.tagName) {
                case 'h3':
                    titles.push(node.children[0].value);
                    tree.children.splice(index, 1);
                    h5counter = 0;
                    break;
                case 'h5':
                    let value = node.children[0].value;
                    let number;
                    const match = value.match(/^\d+/);
                    if (!match) {
                        number = ++h5counter;
                    } else {
                        number = match[0];
                    }
                    value = templates.h5Value({
                        value,
                        number
                    });
                    const anchor = `chapter-${counter}-paragraph-${number}`;

                    node.children[0] = {
                        type: 'element',
                        tagName: 'a',
                        properties: {
                            href: '#' + anchor,
                            name: anchor,
                            className: ['anchor']
                        },
                        children: [
                            {
                                type: 'text',
                                value
                            }
                        ],
                        position: node.children[0].position
                    };

                    break;
            }
            imageProcess(node, tree, index);
        });
        file.data.title = templates.chapterTitleValue({
            titles,
            l10n,
            counter
        });
    };
};

module.exports = (contents, data) => {
    return unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(chapterProcessor)
        .use(rehypeStringify)
        .process({
            contents,
            data
        });
};
