import { BuilderMap } from '../builders';
import { CssAstPlugin } from './plugins/CssAstPlugin';
import { HtmlPlugin } from './plugins/HtmlPlugin';
import { StructurePlugin } from './plugins/StructurePlugin';

export type Pipeline<T, S, B extends keyof BuilderMap<T, S>> = CommonPipeline<
    T,
    S
> &
    PipelineMap<T, S>[B];

export interface CommonPipeline<T, S> {
    structure: {
        plugins: Array<StructurePlugin<T, S>>;
    };
}

export interface PipelineMap<T, S> {
    html: {
        html: {
            plugins: Array<HtmlPlugin>;
        };
        css: {
            plugins: Array<CssAstPlugin<T, S>>;
        };
    };
}
