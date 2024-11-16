import { Context } from '../models/Context';
import { L10n } from '../models/L10n';
import { StructurePlugin } from '../models/plugins/StructurePlugin';
import { Structure } from '../structure/Structure';

export const structurePipeline = async <T, S>(
    structure: Structure,
    context: Context,
    l10n: L10n<T, S>,
    plugins: Array<StructurePlugin<T, S>>
) => {
    for (const plugin of plugins) {
        const state = {
            context,
            l10n
        };
        await plugin(structure, state);
    }
};
