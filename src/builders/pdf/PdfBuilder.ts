import { copyFile, readFile } from 'node:fs/promises';
import { basename } from 'node:path';

import { convertText } from 'html-to-latex';

import { BuilderState } from '../../models/Builder';
import {
    PdfBuilder,
    PdfBuilderOptions
} from '../../models/builders/PdfBuilder';
import { LogLevel } from '../../models/Logger';
import { Pipeline } from '../../models/Pipeline';
import { Strings } from '../../models/Strings';
import { CacheKey, HtmlString, Path } from '../../models/Types';
import { cssAstPipeline } from '../../pipeline/cssAst';
import { Structure } from '../../structure/Structure';
import { tex2pdf } from '../../util/tex2pdf';

export const pdfBuilder: PdfBuilder<any, any> = async <T, S extends Strings>(
    structure: Structure,
    state: BuilderState<T, S>,
    pipeline: Pipeline<T, S, 'pdf'>,
    options: PdfBuilderOptions
) => {
    const cacheKey = basename(options.outFile) as CacheKey;
    const tmpPdfPath = state.context.cache.keyToCachedFile(cacheKey, 'pdf');
    const contentModificationTimeMs =
        structure.getContentModificationTimeMs() ?? Date.now();

    if (options.useCachedContent) {
        await state.context.cache.getCachedOrPutToCache(
            cacheKey,
            contentModificationTimeMs,
            async () => {
                state.context.logger.debug(
                    'PDF not found in cache, generating new one'
                );
                const cachedHtml = await state.context.cache.getCached(
                    basename(options.outFile) as CacheKey,
                    contentModificationTimeMs,
                    'html'
                );
                await doGeneratePdf(
                    structure,
                    state,
                    pipeline,
                    options,
                    tmpPdfPath,
                    contentModificationTimeMs,
                    cachedHtml
                        ? (cachedHtml.toString('utf-8') as HtmlString)
                        : undefined
                );
                return readFile(tmpPdfPath);
            },
            'pdf'
        );
    } else {
        await doGeneratePdf(
            structure,
            state,
            pipeline,
            options,
            tmpPdfPath,
            contentModificationTimeMs
        );
    }

    let filePath = tmpPdfPath;
    for (const plugin of pipeline.pdf.plugins) {
        filePath = await plugin({
            sourceFile: filePath,
            context: state.context,
            l10n: state.l10n,
            structure
        });
    }

    await copyFile(filePath, options.outFile);
};

export const doGeneratePdf = async <T, S extends Strings>(
    structure: Structure,
    state: BuilderState<T, S>,
    pipeline: Pipeline<T, S, 'pdf'>,
    options: PdfBuilderOptions,
    outFile: Path,
    contentModificationTimeMs: number,
    cachedHtml?: HtmlString
) => {
    const css = await cssAstPipeline(
        options.css,
        state.context,
        state.l10n,
        pipeline.css.plugins
    );

    const html =
        cachedHtml ??
        (await state.l10n.templates.htmlPdfDocument(structure, css));

    if (
        cachedHtml === undefined &&
        state.context.options.logLevel <= LogLevel.DEBUG
    ) {
        const file = await state.context.cache.putToCache(
            basename(options.outFile) as CacheKey,
            html,
            'html'
        );
        state.context.logger.debug('HTML for PDF generated', file);
    }

    const tex = await state.context.cache.getCachedOrPutToCache(
        basename(options.outFile) as CacheKey,
        contentModificationTimeMs,
        async () => convertText(html),
        'tex'
    );

    await tex2pdf(tex, outFile);
};
