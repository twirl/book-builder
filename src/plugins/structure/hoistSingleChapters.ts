import {
    StructurePlugin,
    StructurePluginState
} from '../../models/plugins/StructurePlugin';
import { Structure } from '../../structure/Structure';

export const hoistSingleChapters = <T, S>() => {
    const callback: StructurePlugin<T, S> = async (
        structure: Structure,
        _state: StructurePluginState<T, S>
    ) => {
        for (const section of structure.getSections()) {
            const chapters = section.getChapters();
            if (chapters.length === 1) {
                section.setContent(
                    chapters[0].content,
                    chapters[0].modificationTimeMs
                );
                section.removeAllChapters();
            }
        }
    };

    return callback;
};
