const fs = require('fs');
const pathResolve = require('path').resolve;

const builders = require('./src/builders');
const mdHtml = require('./src/md-html');
const htmlProcess = require('./src/html-process');
const cssProcess = require('./src/css-process');
const defaultTemplates = require('./src/templates');

class BookBuilder {
    constructor(structure, content, options) {
        this.structure = structure;
        this.content = content;
        this.options = options;
    }

    build(target, out) {
        return prepareHtml(target, this.content, this.options).then((html) => {
            return builders[target]({
                structure: this.structure,
                html,
                l10n: this.options.l10n,
                basePath: this.options.basePath,
                out
            });
        });
    }
}

BookBuilder.init = async (options) => {
    const { path, basePath, l10n } = options;
    const templates = {
        ...defaultTemplates,
        ...(options.templates || {})
    };
    const pageBreak = templates.pageBreak;
    const structure = await getStructure({
        path,
        basePath,
        l10n,
        templates,
        pageBreak
    });
    const tableOfContents = templates.toc(structure, l10n);
    const htmlContent = [
        structure.frontPage,
        tableOfContents,
        ...structure.sections.map((section, index) =>
            section.chapters
                .reduce(
                    (content, chapter, index) => {
                        if (chapter.title) {
                            content.push(
                                templates.chapterTitle(chapter, {
                                    number: index + 1
                                })
                            );
                        }
                        content.push(chapter.content);
                        return content;
                    },
                    [
                        templates.sectionTitle(section, {
                            number: index + 1
                        })
                    ]
                )
                .join('')
        )
    ];
    return new BookBuilder(structure, htmlContent.join(''), {
        ...options,
        templates
    });
};

const getStructure = async ({ path, basePath, l10n, pageBreak, templates }) => {
    const structure = {
        frontPage:
            fs.readFileSync(pathResolve(path, 'intro.html'), 'utf-8') +
            pageBreak,
        sections: []
    };
    let counter = 1;

    await fs
        .readdirSync(path)
        .filter((p) => fs.statSync(pathResolve(path, p)).isDirectory())
        .sort()
        .reduce(async (p, dir, index) => {
            const structure = await p;
            const name = dir.split('-')[1];
            const section = {
                title: name,
                anchor: `section-${index + 1}`,
                chapters: []
            };

            const subdir = pathResolve(path, dir);
            await fs
                .readdirSync(subdir)
                .filter(
                    (p) =>
                        fs.statSync(pathResolve(subdir, p)).isFile() &&
                        p.indexOf('.md') == p.length - 3
                )
                .sort()
                .reduce(async (p, file) => {
                    const section = await p;
                    const md = fs
                        .readFileSync(pathResolve(subdir, file), 'utf-8')
                        .trim();
                    const content = await mdHtml(md, {
                        counter,
                        l10n,
                        base: basePath,
                        templates
                    });
                    section.chapters.push({
                        anchor: content.data.anchor,
                        title: content.data.title,
                        content: content.contents + pageBreak
                    });
                    counter++;
                    return section;
                }, Promise.resolve(section));

            structure.sections.push(section);
            return structure;
        }, Promise.resolve(structure));

    return structure;
};

const prepareHtml = async (
    target,
    content,
    { templates, path, basePath, l10n }
) => {
    if (target == 'epub') {
        return '';
    } else {
        const css = await prepareCss(target, { path, basePath });
        return (
            await htmlProcess(
                templates[target == 'html' ? 'screenHtml' : 'printHtml'](
                    content,
                    css,
                    l10n
                ),
                {
                    base: basePath
                }
            )
        ).contents;
    }
};

const prepareCss = async (target, { basePath }) => {
    const css = fs.readFileSync(
        pathResolve(basePath, 'css/style.css'),
        'utf-8'
    );
    const mediaCss = fs.readFileSync(
        pathResolve(
            basePath,
            target == 'pdf' ? 'css/print.css' : 'css/screen.css'
        ),
        'utf-8'
    );
    return `${cssProcess(css, { basePath })}\n${cssProcess(mediaCss, {
        basePath
    })}`;
};

module.exports = {
    init: async (options) => BookBuilder.init(options)
};
