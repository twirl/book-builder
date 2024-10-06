import { resolve } from 'node:path';

import { Cache } from './Cache';
import { Logger, LogLevel } from './models/Logger';
import { Options } from './models/Options';
import { Source } from './models/Source';
import { Templates } from './models/Templates';
import { prepareStructure } from './structure/prepare';
import { DEFAULT_TEMPLATES } from './templates/defaultTemplates';

// import builders from './src/builders/index.js';
// import { structurePrepare } from './src/structure-prepare.js';
// import { htmlPrepare } from './src/html-prepare.js';
// import { Cache } from './src/cache.js';

// export { default as plugins } from './src/plugins/index.js';

export class BookBuilder<T extends Templates> {
    constructor(
        private readonly options: Options,
        private readonly cache?: Cache
    ) {
        console.log('It works');
    }

    // async build(target, out, parameters) {
    //     const html = await htmlPrepare(target, {
    //         content: this.content,
    //         css: parameters.css,
    //         extraCss: parameters.extraCss,
    //         options: this.options,
    //         structure: this.structure
    //     });

    //     const {
    //         cover,
    //         lang,
    //         l10n,
    //         sample,
    //         templates,
    //         basePath,
    //         hoistSingleChapters
    //     } = this.options;

    //     return builders[target]({
    //         structure: this.structure,
    //         html,
    //         cover,
    //         lang,
    //         l10n,
    //         sample,
    //         hoistSingleChapters,
    //         css: parameters.css,
    //         templates,
    //         basePath,
    //         htmlSourceValidator: this.options.pipeline.htmlSourceValidator,
    //         out
    //     });
    // }
}
export async function init(parameters: Parameters) {
    const options: Options = {
        ...DEFAULT_OPTIONS,
        ...(parameters.options || {})
    };
    const logger = parameters.logger ?? new ConsoleLogger(options);
    const templates: Templates = {
        ...DEFAULT_TEMPLATES,
        ...parameters.templates
    };
    const cache = new Cache(resolve(options.tmpDir), logger, options.noCache);

    const structure = await prepareStructure(
        parameters.source,
        templates,
        options,
        cache,
        logger
    );

    return new BookBuilder(options, cache);
}

export interface Parameters {
    source: Source;
    templates: Partial<Templates>;
    options: Partial<Options>;
    logger?: Logger;
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
