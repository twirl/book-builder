import { readdirSync, statSync, readFileSync } from 'fs';
import { resolve } from 'path';
import unorm from 'unorm';

import defaultTemplates from './templates.js';
import { htmlPreProcess } from './processors/html-pre-process.js';
import { toc } from './toc.js';
import { references } from './references.js';

export const structurePrepare = async ({
    path,
    basePath,
    l10n,
    templates = {},
    pipeline
}) => {
    templates = {
        ...defaultTemplates,
        ...templates
    };
    const pageBreak = templates.pageBreak;

    const structure = await getStructure({
        path,
        basePath,
        l10n,
        templates,
        pageBreak,
        pipeline
    });

    references.append(structure, { l10n, templates });

    const tocHtml = toc(structure, { templates, l10n });
    const htmlContent = [
        structure.frontPage,
        tocHtml,
        ...structure.sections.map((section, sectionIndex) =>
            (section.chapters || [])
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
                            number: sectionIndex + 1
                        }),
                        section.content || ''
                    ]
                )
                .join('')
        )
    ];

    return { structure, html: htmlContent.join(''), templates };
};

const getStructure = async ({
    path,
    basePath,
    l10n,
    pageBreak,
    templates,
    pipeline
}) => {
    const structure = {
        frontPage: readFile(path, 'intro.html') + pageBreak,
        sections: [],
        references: []
    };
    const plugins = (pipeline && pipeline.ast && pipeline.ast.preProcess) || [];
    let counter = 1;
    let refCounter = 0;

    await readdirSync(path)
        .filter((p) => statSync(resolve(path, p)).isDirectory())
        .sort()
        .reduce(async (p, dir, index) => {
            const structure = await p;
            const name = dir.split('-')[1];
            const section = {
                title: name,
                anchor: `section-${index + 1}`,
                chapters: []
            };

            const subdir = resolve(path, dir);
            await readdirSync(subdir)
                .filter(
                    (p) =>
                        statSync(resolve(subdir, p)).isFile() &&
                        p.indexOf('.md') == p.length - 3
                )
                .sort()
                .reduce(async (p, file) => {
                    const section = await p;
                    const md = readFile(subdir, file).trim();
                    const content = await htmlPreProcess(
                        md,
                        {
                            counter,
                            refCounter,
                            l10n,
                            base: basePath,
                            templates
                        },
                        plugins
                    );
                    section.chapters.push({
                        anchor: content.data.anchor,
                        title: content.data.title,
                        content: content.value + pageBreak,
                        references: content.data.references || null
                    });
                    refCounter = content.data.refCounter;
                    counter++;
                    return section;
                }, Promise.resolve(section));

            structure.sections.push(section);
            return structure;
        }, Promise.resolve(structure));

    return structure;
};

const readFile = (...parts) => {
    return unorm.nfd(readFileSync(resolve(...parts), 'utf-8'));
};
