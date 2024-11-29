import { StructurePluginState } from '../../models/plugins/StructurePlugin';
import { Structure } from '../../structure/Structure';
import { applyAstPluginToStructure } from '../../util/applyAstPluginToStructure';
import { epubLink as epubLinkAst } from '../structureAst/epubLink';

export const epubLink =
    () =>
    <T, S>(structure: Structure, state: StructurePluginState<T, S>) => {
        const epubLinkMap = new Map<string, string>();
        for (const section of structure.getSections()) {
            epubLinkMap.set(
                section.anchor,
                state.l10n.templates.epubSectionFilename(section)
            );
            for (const chapter of section.getChapters()) {
                epubLinkMap.set(
                    chapter.anchor,
                    state.l10n.templates.epubChapterFilename(chapter)
                );
            }
        }

        return applyAstPluginToStructure(
            state.context,
            state.l10n,
            structure,
            epubLinkAst(epubLinkMap)
        );
    };
