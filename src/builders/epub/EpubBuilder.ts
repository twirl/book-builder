import { writeFile } from 'node:fs/promises';

import epub, { Chapter as EpubChapter } from 'epub-gen-memory';

import { BuilderState } from '../../models/Builder';
import {
    EpubBuilder,
    EpubBuilderOptions
} from '../../models/builders/EpubBuilder';
import { LogLevel } from '../../models/Logger';
import { Pipeline } from '../../models/Pipeline';
import { Strings } from '../../models/Strings';
import { cssAstPipeline } from '../../pipeline/cssAst';
import { Structure } from '../../structure/Structure';
import { resolveFileSrc } from '../../util/resolveFileSrc';

export const epubBuilder: EpubBuilder<any, any> = async <T, S extends Strings>(
    structure: Structure,
    state: BuilderState<T, S>,
    pipeline: Pipeline<T, S, 'epub'>,
    options: EpubBuilderOptions
) => {
    const css = await cssAstPipeline(
        options.css,
        state.context,
        state.l10n,
        pipeline.css.plugins
    );

    const epubChapters: EpubChapter[] = [];
    for (const section of structure.getSections()) {
        epubChapters.push({
            title: state.l10n.templates.sectionTitle(section),
            content: await state.l10n.templates.htmlEpubSectionContent(section),
            excludeFromToc: !section.inTableOfContents(),
            beforeToc: !section.inTableOfContents(),
            filename: state.l10n.templates.epubSectionFilename(section)
        });
        for (const chapter of section.getChapters()) {
            const html = await state.l10n.templates.htmlEpubChapterContent(
                chapter,
                section
            );
            epubChapters.push({
                title: state.l10n.templates.chapterTitle(chapter),
                content: html,
                filename: state.l10n.templates.epubChapterFilename(chapter)
            });
        }
    }

    const { title, author, description, toc } = state.l10n.strings;
    const content = await epub(
        {
            title,
            author,
            description,
            tocTitle: toc,
            lang: state.l10n.language,
            css,
            cover: state.l10n.strings.coverImageUrl
                ? resolveFileSrc(
                      state.l10n.strings.coverImageUrl,
                      state.context.source.base
                  )
                : undefined,
            verbose: state.context.options.logLevel <= LogLevel.DEBUG
        },
        epubChapters
    );

    await writeFile(options.outFile, content);
};
