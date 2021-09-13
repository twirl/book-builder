import builders from './src/builders/index.js';
import { structurePrepare } from './src/structure-prepare.js';
import { htmlPrepare } from './src/html-prepare.js';
export { default as plugins } from './src/plugins/index.js';

class BookBuilder {
    constructor(structure, content, options) {
        this.structure = structure;
        this.content = content;
        this.options = options;
    }

    async build(target, out) {
        const html = await htmlPrepare(target, this.content, this.options);
        return builders[target]({
            structure: this.structure,
            html,
            l10n: this.options.l10n,
            basePath: this.options.basePath,
            out
        });
    }
}

BookBuilder.init = async (options) => {
    const { structure, html, templates } = await structurePrepare(options);
    return new BookBuilder(structure, html, {
        ...options,
        templates
    });
};

export const init = async (options) => BookBuilder.init(options);
