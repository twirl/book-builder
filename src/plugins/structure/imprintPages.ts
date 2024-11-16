import { StructurePluginState } from '../../models/plugins/StructurePlugin';
import { htmlToAst } from '../../preprocessors/html';
import { Section, Structure } from '../../structure/Structure';

export const imprintPages =
    (html: string) =>
    async <T, S>(structure: Structure, state: StructurePluginState<T, S>) => {
        structure.prependSection(
            new Section(
                undefined,
                undefined,
                undefined,
                await htmlToAst(html),
                true
            ),
            0
        );
    };
