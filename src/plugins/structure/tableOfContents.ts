import { StructurePluginState } from '../../models/plugins/StructurePlugin';
import { htmlToAst } from '../../preprocessors/html';
import { Section, Structure } from '../../structure/Structure';

export const tableOfContents =
    (options: Partial<TocOptions> = {}) =>
    async <T, S>(structure: Structure, state: StructurePluginState<T, S>) => {
        structure.prependSection(
            new Section(
                undefined,
                undefined,
                undefined,
                await htmlToAst(
                    await state.l10n.templates.htmlTableOfContents(structure)
                ),
                true
            ),
            0
        );
    };

export interface TocOptions {}
