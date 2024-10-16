import { resolve } from 'node:path';

import { Cache } from './Cache';
import { Context } from './models/Context';
import { L10n } from './models/L10n';
import { Logger, LogLevel } from './models/Logger';
import { Options } from './models/Options';
import { ChapterAstPlugin } from './models/plugins/ChapterAstPlugin';
import { Source } from './models/Source';
import { Strings } from './models/Strings';
import { Templates } from './models/Templates';
import { getStructure, Structure } from './structure/Structure';
import { DEFAULT_TEMPLATES } from './templates/defaultTemplates';

export class BookBuilder<T, S> {
    constructor(
        private readonly structure: Structure,
        private readonly context: Context,
        private readonly l10n: L10n<T, S>,
        private readonly pipeline?: Pipeline<T, S>
    ) {
        console.log('It works');
    }
}

export async function init<T, S>(parameters: Parameters<T, S>) {
    const options: Options = {
        ...DEFAULT_OPTIONS,
        ...(parameters.options || {})
    };
    const logger = parameters.logger ?? new ConsoleLogger(options);
    const cache = new Cache(resolve(options.tmpDir), logger, options.noCache);
    const context: Context = { logger, cache, options };

    const l10n: L10n<T, S> = {
        strings: parameters.l10n.strings,
        templates: {
            ...DEFAULT_TEMPLATES,
            ...parameters.l10n.templates
        }
    };

    const structure = await getStructure(
        parameters.source,
        context,
        l10n,
        parameters.pipeline?.chapterAstPlugins ?? []
    );

    return new BookBuilder(structure, context, l10n, parameters.pipeline);
}

export interface Parameters<T, S> {
    source: Source;
    l10n: {
        strings: S & Strings;
        templates: T & Partial<Templates>;
    };
    options: Partial<Options>;
    pipeline?: Pipeline<T, S>;
    logger?: Logger;
}

export interface Pipeline<T, S> {
    chapterAstPlugins: ChapterAstPlugin<T, S>[];
}

export const DEFAULT_OPTIONS: Options = {
    tmpDir: './tmp',
    noCache: false,
    logLevel: LogLevel.ERROR,
    sample: false,
    hoistSingleChapters: false
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
