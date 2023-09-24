import { resolve } from 'path';

import builders from './src/builders/index.js';
import { structurePrepare } from './src/structure-prepare.js';
import { htmlPrepare } from './src/html-prepare.js';
import { Cache } from './src/cache.js';

export { default as plugins } from './src/plugins/index.js';

export const init = async (options) => {
    const cache = options.noCache
        ? null
        : new Cache(options.tmpDir || resolve('.tmp/'));
    const { structure, html, templates } = await structurePrepare(
        options,
        cache
    );
    return new BookBuilder(structure, html, {
        ...options,
        templates,
        cache
    });
};

class BookBuilder {
    constructor(structure, content, options) {
        this.structure = structure;
        this.content = content;
        this.options = options;
    }

    async build(target, out, parameters) {
        const html = await htmlPrepare(target, {
            content: this.content,
            css: parameters.css,
            extraCss: parameters.extraCss,
            options: this.options,
            structure: this.structure
        });

        return builders[target]({
            structure: this.structure,
            html,
            cover: this.options.cover,
            lang: this.options.lang,
            l10n: this.options.l10n,
            sample: this.options.sample,
            css: parameters.css,
            templates: this.options.templates,
            basePath: this.options.basePath,
            htmlSourceValidator: this.options.pipeline.htmlSourceValidator,
            out
        });
    }
}
