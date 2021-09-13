import { cssPrepare } from './css-prepare.js';
import { htmlPostProcess } from './processors/html-post-process.js';

export const htmlPrepare = async (
    target,
    content,
    { templates, path, basePath, l10n, pipeline }
) => {
    if (target == 'epub') {
        return '';
    } else {
        const css = await cssPrepare(target, {
            path,
            basePath,
            plugins: (pipeline && pipeline.css) || {}
        });
        return htmlPostProcess(
            templates[target == 'html' ? 'screenHtml' : 'printHtml'](
                content,
                css,
                l10n
            ),
            {
                base: basePath,
                plugins:
                    (pipeline && pipeline.html && pipeline.html.postProcess) ||
                    []
            }
        );
    }
};
