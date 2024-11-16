import { ElementContent } from 'hast';

import { Section } from '../../structure/Structure';
import { AstPlugin } from '../AstPlugin';
import { Chapter } from '../Chapter';
import { Context } from '../Context';
import { L10n } from '../L10n';

export type StructureAstPlugin<T, S> = AstPlugin<
    StructureAstState<T, S>,
    ElementContent
>;

export interface StructureAstState<T, S> {
    context: Context;
    l10n: L10n<T, S>;
    chapter: Chapter;
    section: Section;
}
