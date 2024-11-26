import { StructurePluginState } from '../../models/plugins/StructurePlugin';
import { Bibliography } from '../../models/Reference';
import { Strings } from '../../models/Strings';
import { htmlToAstElements } from '../../preprocessors/html';
import { Section, Structure } from '../../structure/Structure';
import { applyAstPluginToStructure } from '../../util/applyAstPluginToStructure';
import { ref, RefAstPluginRunner } from '../structureAst/ref';

export const reference =
    ({
        refPrefix = 'ref',
        bibliography = {},
        anchor = 'bibliography'
    }: Partial<ReferencePluginOptions> = {}) =>
    async <T, S extends Strings = Strings>(
        structure: Structure,
        state: StructurePluginState<T, S>
    ) => {
        await applyAstPluginToStructure<T, S>(
            state.context,
            state.l10n,
            structure,
            ref<T, S>({ prefix: refPrefix }),
            {
                onChapterEnd: async (runner, _state, chapter, section) => {
                    const refs = (runner as RefAstPluginRunner<T, S>).getRefs();
                    if (refs.length) {
                        chapter.content.children.push(
                            ...(await htmlToAstElements(
                                await state.l10n.templates.htmlChapterReferences(
                                    refs,
                                    chapter,
                                    section,
                                    bibliography
                                )
                            ))
                        );
                    }
                }
            }
        );
        structure.appendSection(
            new Section(state.l10n.strings.bibliography, anchor, undefined, {
                type: 'root',
                children: await htmlToAstElements(
                    await state.l10n.templates.htmlBibliography(bibliography)
                )
            })
        );
    };

export interface ReferencePluginOptions {
    refPrefix: string;
    bibliography?: Bibliography;
    anchor?: string;
}
