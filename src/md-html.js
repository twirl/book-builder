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

        file.data.anchor = `chapter-${counter}`;

        let h5counter = 0;
        let refCounter = 0;

        const titles = [];
        const references = [];

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

        const refProcess = function (node, parent, index) {
            let processChildren = node.children && node.children.length;
            if (
                node.tagName == 'a' &&
                node.children &&
                node.children.length == 1 &&
                node.children[0].type == 'text'
            ) {
                const ref = (node.children[0].value || '').slice(0, 3);
                const href = node.properties.href;

                if (ref == 'ref') {
                    refCounter++;
                    const text = node.children[0].value.slice(4);
                    const anchor = `#${file.data.anchor}-ref-${refCounter}`;
                    const backAnchor = `${anchor}-back`;

                    node.properties.href = anchor;
                    node.properties.name = backAnchor.replace(/^#/, '');
                    node.properties.className = ['ref'];

                    node.children[0].value = `[${refCounter}]`;

                    references.push({
                        text,
                        href,
                        anchor,
                        backAnchor,
                        counter: refCounter
                    });
                }
            }
            if (processChildren) {
                node.children.forEach((child, index) =>
                    refProcess(child, node, index)
                );
            }
        };

        tree.children.slice().forEach((node, index) => {
            switch (node.tagName) {
                case 'h3':
                    titles.push(node.children[0].value);
                    tree.children[index] = 'deleted';
                    node = null;
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
                case 'p':
                    const incuts = {
                        funFact: 'Fun Fact: ',
                        beerMyth: 'Beer Myth: '
                    };
                    if (
                        node.children &&
                        node.children.length &&
                        node.children[0].type == 'text'
                    ) {
                        const incut = Object.entries(incuts).reduce(
                            (incut, [type, signature]) => {
                                return (
                                    incut ||
                                    (node.children[0].value.indexOf(
                                        signature
                                    ) == 0
                                        ? type
                                        : false)
                                );
                            },
                            false
                        );
                        if (incut) {
                            node.children[0].value =
                                node.children[0].value.slice(
                                    incuts[incut].length
                                );
                            tree.children.splice(index, 1, {
                                type: 'element',
                                tagName: 'div',
                                properties: {
                                    className: [incut]
                                },
                                children: [
                                    {
                                        type: 'element',
                                        tagName: 'h5',
                                        children: [
                                            {
                                                type: 'text',
                                                value: l10n[incut]
                                            }
                                        ],
                                        position: node.position
                                    },
                                    node
                                ],
                                position: node.position
                            });
                            node = tree.children[index];
                        }
                    }
                    break;
            }
            if (node) {
                imageProcess(node, tree, index);
                refProcess(node, tree, index);
            }
        });

        tree.children = tree.children.filter((c) => c != 'deleted');

        if (references.length) {
            tree.children.push(
                templates.references({
                    references,
                    position: tree.children[tree.children.length - 1].position,
                    l10n
                })
            );
        }

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
