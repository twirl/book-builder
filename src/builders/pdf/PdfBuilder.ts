import { basename } from 'node:path';

import puppeteer from 'puppeteer';

import { BuilderState } from '../../models/Builder';
import { PdfBuilderOptions } from '../../models/builders/PdfBuilder';
import { LogLevel } from '../../models/Logger';
import { Pipeline } from '../../models/Pipeline';
import { Strings } from '../../models/Strings';
import { CacheKey, HtmlString, Path } from '../../models/Types';
import { cssAstPipeline } from '../../pipeline/cssAst';
import { Structure } from '../../structure/Structure';

export const pdfBuilder = async <T, S extends Strings>(
    structure: Structure,
    state: BuilderState<T, S>,
    pipeline: Pipeline<T, S, 'pdf'>,
    options: PdfBuilderOptions
) => {
    const contentModificationTimeMs =
        structure.getContentModificationTimeMs() ?? Date.now();

    if (options.useCachedContent) {
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
            options.outFile,
            cachedHtml
                ? (cachedHtml.toString('utf-8') as HtmlString)
                : undefined
        );
    } else {
        await doGeneratePdf(
            structure,
            state,
            pipeline,
            options,
            options.outFile
        );
    }
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
        path: outFile,
        preferCSSPageSize: true,
        printBackground: true,
        timeout: 0
    });

    await browser.close();
};
