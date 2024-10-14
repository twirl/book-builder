import { Cache } from '../Cache';
import { Logger } from '../models/Logger';
import { Options } from '../models/Options';
import { Source } from '../models/Source';
import { Structure } from '../models/Structure';
import { readdirSync, statSync, readFileSync } from 'fs';
import { resolve } from 'path';

import { htmlPreProcess } from './processors/html-pre-process.js';
import { toc } from './toc.js';
import { references } from './references.js';
import { Templates } from '../models/Templates';

export async function prepareStructure(
    source: Source,
    templates: Templates,
    options: Options,
    cache: Cache,
    logger: Logger
): Promise<Structure> {
    const pageBreak = templates.pageBreak;

    const [begin, end] = options.chapterRange ?? [null, null];

    const structure = await getStructure(
        source,
        templates,
        options,
        cache,
        logger
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
}

const getStructure = async (
    {
        path,
        basePath,
        l10n,
        templates,
        pipeline,
        begin,
        end,
        sample,
        hoistSingleChapters
    },
    cache
) => {
    const plugins = (pipeline && pipeline.ast && pipeline.ast.preProcess) || [];
    let counter = 1;
    let refCounter = 0;
    let stat = {
        words: 0,
        uniqueWords: new Set(),
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
            const name = dir.replace(/^[^\-]*-/, '');
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

    if (hoistSingleChapters) {
        for (let i = 0; i < structure.sections.length; i++) {
            const section = structure.sections[i];
            if (section.chapters?.length == 1) {
                structure.sections[i] = section.chapters[0];
            }
        }
    }

    structure.words = stat?.words;
    structure.uniqueWords = stat?.uniqueWords?.size;
    structure.characters = stat?.characters;

    return structure;
};

const readFile = (...parts) => {
    return unorm.nfd(readFileSync(resolve(...parts), 'utf-8'));
};
