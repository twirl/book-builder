import { parse, generate } from 'css-tree';

import { Context } from '../models/Context';
import { L10n } from '../models/L10n';
import { CssAstPlugin } from '../models/plugins/CssAstPlugin';
import { applyCssPluginToAst } from '../util/applyCssAstPlugin';

export const cssAstPipeline = async <T, S>(
    css: string,
    context: Context,
    l10n: L10n<T, S>,
    plugins: CssAstPlugin<T, S>[]
): Promise<string> => {
    const ast = parse(css);
    const state = { context, l10n };
    if (ast.type === 'StyleSheet') {
        for (const plugin of plugins) {
            await applyCssPluginToAst(ast, plugin, state);
        }
    } else {
        context.logger.debug('CSS is not parsed into a stylesheet', css);
    }
    return generate(ast);
};
