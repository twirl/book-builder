import { ElementContent } from 'hast';

import { Section } from '../../structure/Structure';
import { AstPlugin } from '../AstPlugin';
import { Chapter } from '../Chapter';
import { Context } from '../Context';
import { L10n } from '../L10n';

export interface ChapterState<T, S> {
    context: Context;
    l10n: L10n<T, S>;
    chapter: Chapter;
    section: Section;
}

export type ChapterAstPlugin<T, S> = AstPlugin<
    ChapterState<T, S>,
    ElementContent
> & {
    type: 'chapter_ast_plugin';
};
