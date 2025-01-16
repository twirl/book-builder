import { StructurePluginState } from '../../models/plugins/StructurePlugin';
import { htmlToAst } from '../../preprocessors/html';
import { Section } from '../../structure/Section';
import { Structure } from '../../structure/Structure';

export const imprintPages =
    (html: string, anchor: string) =>
    async <T, S>(structure: Structure, state: StructurePluginState<T, S>) => {
        structure.prependSection(
            new Section(
                anchor,
                undefined,
                undefined,
                await htmlToAst(html),
                true
            ),
            0
        );
    };
