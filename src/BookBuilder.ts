import { resolve } from 'node:path';

import datauri from 'datauri';

import { BuilderMap, BuilderOptionsMap } from './builders';
import { epubBuilder } from './builders/epub/EpubBuilder';
import { htmlBuilder } from './builders/html/HtmlBuilder';
import { pdfBuilder } from './builders/pdf/PdfBuilder';
import { Cache } from './Cache';
import { BuilderState } from './models/Builder';
import { Context } from './models/Context';
import { L10n } from './models/L10n';
import { Logger, LogLevel } from './models/Logger';
import { Options } from './models/Options';
import { Pipeline } from './models/Pipeline';
import { StructureAstPlugin } from './models/plugins/StructureAstPlugin';
import { Source } from './models/Source';
import { Strings } from './models/Strings';
import { Templates } from './models/Templates';
import { Path } from './models/Types';
import { structurePipeline } from './pipeline/structure';
import { getStructure, Structure } from './structure/Structure';

export class BookBuilder {
    constructor(
        public readonly structure: Structure,
        public readonly context: Context
    ) {}

    public async build<
        T extends Templates<S & Strings>,
        S extends Strings,
        B extends keyof BuilderMap<T, S>
    >(
        target: B,
        l10n: L10n<T, S>,
        pipeline: Pipeline<T, S, B>,
        options: BuilderOptionsMap[B]
    ): Promise<void> {
        await structurePipeline(
            this.structure,
            this.context,
            l10n,
            pipeline.structure.plugins
        );

        const state: BuilderState<T, S> = {
            l10n,
            context: this.context
        };

        switch (target) {
            case 'html':
                await htmlBuilder(
                    this.structure,
                    state,
                    pipeline as Pipeline<T, S, 'html'>,
                    options
                );
                break;
            case 'epub':
                await epubBuilder(
                    this.structure,
                    state,
                    pipeline as Pipeline<T, S, 'epub'>,
                    options
                );
                break;
            case 'pdf':
                await pdfBuilder(
                    this.structure,
                    state,
                    pipeline as Pipeline<T, S, 'pdf'>,
                    options
                );
                break;
            default:
                this.context.logger.error('Unknown target', target);
                throw new Error(`Unknown target: ${target}`);
        }
    }

    public async toDataUri(path: string): Promise<string> {
        return (
            (await datauri(
                resolve(this.context.source.base, ...path.split('/'))
            )) ?? path
        );
    }
}

export async function init(parameters: Parameters) {
    const options: Options = {
        ...DEFAULT_OPTIONS,
        ...(parameters.options || {})
    };
    const logger = parameters.logger ?? new ConsoleLogger(options);
    const cache = await Cache.init(
        logger,
        resolve(options.tmpDir) as Path,
        options.noCache,
        options.purgeCache
    );
    const context: Context = {
        logger,
        cache,
        options,
        source: parameters.source
    };

    const structure = await getStructure(parameters.source, context);

    return new BookBuilder(structure, context);
}

export interface Parameters {
    source: Source;
    options: Partial<Options>;
    logger?: Logger;
}

export interface AstPipeline<T, S> {
    chapterAstPlugins: StructureAstPlugin<T, S>[];
}

export const DEFAULT_OPTIONS: Options = {
    tmpDir: './tmp' as Path,
    noCache: false,
    purgeCache: false,
    logLevel: LogLevel.DEBUG,
    sample: false
};

export class ConsoleLogger {
    constructor(private readonly options: Options) {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public debug(...args: any[]) {
        if (this.options.logLevel <= LogLevel.DEBUG) {
            console.log(...args);
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public error(...args: any[]) {
        console.error(...args);
    }
}
