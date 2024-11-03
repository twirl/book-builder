import { resolve } from 'node:path';

import { BuilderMap, BuilderOptionsMap, BuilderPluginMap } from './builders';
import { htmlBuilder } from './builders/html/HtmlBuilder';
import { Cache } from './Cache';
import { BuilderState } from './models/Builder';
import { Context } from './models/Context';
import { L10n } from './models/L10n';
import { Logger, LogLevel } from './models/Logger';
import { Options } from './models/Options';
import { Pipeline } from './models/Pipeline';
import { ChapterAstPlugin } from './models/plugins/ChapterAstPlugin';
import { Source } from './models/Source';
import { Strings } from './models/Strings';
import { Templates } from './models/Templates';
import { chapterAstPipeline } from './pipeline/chapterAst';
import { structurePipeline } from './pipeline/structure';
import { getStructure, Structure } from './structure/Structure';
import { DEFAULT_TEMPLATES } from './templates/defaultTemplates';

export class BookBuilder {
    constructor(
        private readonly structure: Structure,
        private readonly context: Context
    ) {}

    public async build<T, S, B extends keyof BuilderMap<T, S>>(
        target: B,
        l10nParameters: {
            strings: Strings & S;
            language: string;
            locale: string;
            templates: Partial<Templates> & T;
        },
        pipeline: Pipeline<T, S, B>,
        options: BuilderOptionsMap[B]
    ): Promise<void> {
        const l10n: L10n<T, S> = {
            strings: l10nParameters.strings,
            language: l10nParameters.language,
            locale: l10nParameters.locale,
            templates: {
                ...DEFAULT_TEMPLATES,
                ...l10nParameters.templates
            }
        };

        await chapterAstPipeline(
            this.structure,
            this.context,
            l10n,
            pipeline.chapters.astPlugins
        );

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
                await htmlBuilder(this.structure, state, pipeline, options);
                break;
            default:
                this.context.logger.error('Unknown target', target);
                throw new Error(`Unknown target: ${target}`);
        }
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
        resolve(options.tmpDir),
        options.noCache
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
    chapterAstPlugins: ChapterAstPlugin<T, S>[];
}

export const DEFAULT_OPTIONS: Options = {
    tmpDir: './tmp',
    noCache: false,
    logLevel: LogLevel.ERROR,
    sample: false
};

export class ConsoleLogger {
    constructor(private readonly options: Options) {}
    public debug(...args: any[]) {
        if (this.options.logLevel >= LogLevel.DEBUG) {
            console.log(...args);
        }
    }
    public error(...args: any[]) {
        console.error(...args);
    }
}
