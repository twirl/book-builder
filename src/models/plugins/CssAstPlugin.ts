import { CssNode } from 'css-tree';

import { AstPlugin } from '../AstPlugin';
import { Context } from '../Context';
import { L10n } from '../L10n';

export interface CssPluginState<T, S> {
    context: Context;
    l10n: L10n<T, S>;
}

export type CssAstPlugin<T, S> = AstPlugin<CssPluginState<T, S>, CssNode>;
