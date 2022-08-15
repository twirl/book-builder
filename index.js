import builders from './src/builders/index.js';
import { structurePrepare } from './src/structure-prepare.js';
import { htmlPrepare } from './src/html-prepare.js';
export { default as plugins } from './src/plugins/index.js';

export const init = async (options) => {
    const { structure, html, templates } = await structurePrepare(options);
    return new BookBuilder(structure, html, {
        ...options,
        templates
    });
};

class BookBuilder {
    constructor(structure, content, options) {
        this.structure = structure;
        this.content = content;
        this.options = options;
    }

    async build(target, out) {
        const html = await htmlPrepare(target, {
            content: this.content,
            options: this.options,
            structure: this.structure
        });

        return builders[target]({
            structure: this.structure,
            html,
            l10n: this.options.l10n,
            basePath: this.options.basePath,
            htmlSourceValidator: this.options.pipeline.htmlSourceValidator,
            out
        });
    }
}
