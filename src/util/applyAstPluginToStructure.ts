import { Chapter } from '../models/Chapter';
import { Context } from '../models/Context';
import { L10n } from '../models/L10n';
import {
    StructureAstPlugin,
    StructureAstPluginRunner,
    StructureAstState
} from '../models/plugins/StructureAstPlugin';
import { StructurePlugin } from '../models/plugins/StructurePlugin';
import { Section, Structure } from '../structure/Structure';
import { applyHastPluginToAst } from './applyHastAstPlugin';

export const applyAstPluginToStructure = async <T, S>(
    context: Context,
    l10n: L10n<T, S>,
    structure: Structure,
    plugin: StructureAstPlugin<T, S>,
    {
        onSectionBegin,
        onSectionEnd,
        onChapterEnd,
        onEnd
    }: Partial<StructureHooks<T, S>> = {}
) => {
    for (const section of structure.getSections()) {
        if (onSectionBegin) {
            await onSectionBegin(section);
        }
        for (const chapter of section.getChapters()) {
            const state: StructureAstState<T, S> = {
                context,
                l10n,
                chapter,
                section
            };
            const runner = await applyHastPluginToAst(
                chapter.content,
                plugin,
                state
            );
            if (onChapterEnd) {
                await onChapterEnd(runner, state, chapter, section);
            }
        }
        if (onSectionEnd) {
            await onSectionEnd(section);
        }
    }
    if (onEnd) {
        await onEnd();
    }
};

export type StructurePluginBuilder<T, S> = () => StructurePlugin<T, S>;

export interface StructureHooks<T, S> {
    onSectionBegin: (section: Section) => Promise<void>;
    onSectionEnd: (section: Section) => Promise<void>;
    onChapterEnd: (
        runner: StructureAstPluginRunner<T, S>,
        state: StructureAstState<T, S>,
        chapter: Chapter,
        section: Section
    ) => Promise<void>;
    onEnd: () => Promise<void>;
}
