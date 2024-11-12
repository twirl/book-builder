import { writeFile } from 'node:fs/promises';

import { Builder, BuilderState } from '../../models/Builder';
import { Pipeline } from '../../models/Pipeline';
import { cssAstPipeline } from '../../pipeline/cssAst';
import { Structure } from '../../structure/Structure';

export type HtmlBuilder<T, S> = Builder<T, S, HtmlBuilderOptions, 'html'>;

export const htmlBuilder: HtmlBuilder<any, any> = async <T, S>(
    structure: Structure,
    state: BuilderState<T, S>,
    pipeline: Pipeline<T, S, 'html'>,
    options: HtmlBuilderOptions
) => {
    const css = await cssAstPipeline(
        options.css,
        state.context,
        state.l10n,
        pipeline.css.plugins
    );

    let html = await state.l10n.templates.htmlDocument(structure, css);
    for (const plugin of pipeline.html.plugins) {
        html = await plugin(html, state);
    }

    await writeFile(options.outFile, html);
};

export interface HtmlBuilderOptions {
    css: string;
    outFile: string;
}
