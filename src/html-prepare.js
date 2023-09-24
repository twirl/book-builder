import { cssPrepare } from './css-prepare.js';
import { htmlPostProcess } from './processors/html-post-process.js';
import { resolveSrc } from './util/resolve-src.js';

export const htmlPrepare = async (
    target,
    { content, options, structure, css: rawCss, extraCss }
) => {
    const { templates, pipeline } = options;
    if (target == 'epub') {
        return '';
    } else {
        const css = await cssPrepare(
            rawCss,
            options,
            (pipeline && pipeline.css) || {},
            extraCss
        );
        return htmlPostProcess(
            templates[target == 'html' ? 'screenHtml' : 'printHtml'](
                content,
                css,
                {
                    ...options,
                    structure,
                    resolveSrc: (src) => resolveSrc(src, options.basePath)
                }
            ),
            {
                ...options,
                plugins:
                    (pipeline && pipeline.html && pipeline.html.postProcess) ||
                    []
            }
        );
    }
};
