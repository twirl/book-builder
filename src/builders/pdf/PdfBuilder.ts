import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

import muhammara from 'muhammara';
import puppeteer from 'puppeteer';

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

export const pdfBuilder: PdfBuilder<any, any> = async <T, S extends Strings>(
    structure: Structure,
    state: BuilderState<T, S>,
    pipeline: Pipeline<T, S, 'pdf'>,
    options: PdfBuilderOptions
) => {
    const cacheKey = basename(options.outFile) as CacheKey;
    const tmpPdfPath = state.context.cache.keyToCachedFile(cacheKey);
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
                return doGeneratePdf(
                    structure,
                    state,
                    pipeline,
                    options,
                    tmpPdfPath,
                    cachedHtml
                        ? (cachedHtml.toString('utf-8') as HtmlString)
                        : undefined
                );
            },
            'pdf'
        );
    } else {
        await doGeneratePdf(structure, state, pipeline, options, tmpPdfPath);
    }

    const writer = muhammara.createWriterToModify(tmpPdfPath, {
        modifiedFilePath: options.outFile
    });
    const reader = muhammara.createReader(tmpPdfPath);

    for (const plugin of pipeline.pdf.plugins) {
        await plugin({
            writer,
            reader,
            context: state.context,
            l10n: state.l10n
        });
    }

    writer.end();
};

export const doGeneratePdf = async <T, S extends Strings>(
    structure: Structure,
    state: BuilderState<T, S>,
    pipeline: Pipeline<T, S, 'pdf'>,
    options: PdfBuilderOptions,
    outFile: Path,
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

    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();

    await page.setContent(html, {
        waitUntil: 'networkidle0'
    });

    await page.pdf({
        path: options.outFile,
        preferCSSPageSize: true,
        printBackground: true,
        timeout: 0
    });

    await browser.close();

    return readFile(options.outFile);
};
