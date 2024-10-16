import { AstPlugin } from '../AstPlugin';
import { Context } from '../Context';
import { L10n } from '../L10n';

export interface ChapterState<T, S> {
    context: Context;
    l10n: L10n<T, S>;
    counter: number;
    title: string;
    anchor: string;
    path: string;
}

export type ChapterAstPlugin<T, S> = AstPlugin<ChapterState<T, S>>;
