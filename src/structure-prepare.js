import { readdirSync, statSync, readFileSync } from 'fs';
import { resolve } from 'path';
import unorm from 'unorm';

import defaultTemplates from './templates.js';
import { htmlPreProcess } from './processors/html-pre-process.js';
import { toc } from './toc.js';
import { references } from './references.js';

export const structurePrepare = async (
    { path, basePath, l10n, templates = {}, pipeline, chapters, sample },
    cache
) => {
    templates = {
        ...defaultTemplates,
        ...templates
    };
    const pageBreak = templates.pageBreak;

    let begin, end;
    if (chapters) {
        [begin, end] = chapters
            .split('-')
            .map((v, i, arr) => (v ? Number(v) : Number(arr[i - 1] + 1)));
    }

    const structure = await getStructure(
        {
            path,
            basePath,
            l10n,
            templates,
            pageBreak,
            pipeline,
            begin,
            end,
            sample
        },
        cache
    );

    references.appendTo(structure, { l10n, templates });

    const tocHtml = toc(structure, { templates, l10n });
    const htmlContent = [
        structure.frontPage,
        tocHtml,
        templates.mainContent(
            structure.sections
                .map((section, sectionIndex) =>
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
                                content.push(pageBreak);
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
                .join(''),
            { l10n }
        )
    ];

    return { structure, html: htmlContent.join(''), templates };
};

const getStructure = async (
    { path, basePath, l10n, templates, pipeline, begin, end, sample },
    cache
) => {
    const plugins = (pipeline && pipeline.ast && pipeline.ast.preProcess) || [];
    let counter = 1;
    let refCounter = 0;
    let stat = {
        words: 0,
        characters: 0
    };
    const structure = {
        frontPage: sample
            ? templates.samplePage({ templates, l10n })
            : templates.frontPage({ templates, l10n }),
        sections: [],
        references: []
    };

    await readdirSync(path)
        .filter((p) => statSync(resolve(path, p)).isDirectory())
        .sort()
        .reduce(async (p, dir, index) => {
            const structure = await p;
            const name = dir.split('-')[1];
            const subdir = resolve(path, dir);
            const section = {
                title: name,
                anchor: `section-${index + 1}`,
                filename: `section-${index + 1}.xhtml`,
                chapters: []
            };

            await readdirSync(subdir)
                .filter(
                    (p) =>
                        statSync(resolve(subdir, p)).isFile() &&
                        p.indexOf('.md') == p.length - 3
                )
                .sort()
                .reduce(async (p, file, i) => {
                    const section = await p;
                    if (!begin || (counter >= begin && counter <= end)) {
                        const filePath = resolve(subdir, file);
                        let content = cache
                            ? await cache.get(
                                  filePath,
                                  statSync(filePath).mtimeMs,
                                  true
                              )
                            : null;
                        if (!content) {
                            const md = readFile(subdir, file).trim();
                            content = await htmlPreProcess(
                                md,
                                {
                                    counter,
                                    refCounter,
                                    stat,
                                    l10n,
                                    base: basePath,
                                    templates
                                },
                                plugins
                            );
                            if (cache) {
                                await cache.put(filePath, content);
                            }
                        }
                        section.chapters.push({
                            anchor: content.data.anchor,
                            filename: `${content.data.anchor}.xhtml`,
                            secondaryAnchor: content.data.secondaryAnchor,
                            title: content.data.title,
                            content: content.value,
                            references: content.data.references || null
                        });
                        refCounter = content.data.refCounter;
                        stat = content.data.stat;
                    }
                    counter++;
                    return section;
                }, Promise.resolve(section));

            structure.sections.push(section);
            return structure;
        }, Promise.resolve(structure));

    structure.words = stat?.words;
    structure.characters = stat?.characters;

    return structure;
};

const readFile = (...parts) => {
    return unorm.nfd(readFileSync(resolve(...parts), 'utf-8'));
};
