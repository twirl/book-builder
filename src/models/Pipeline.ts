import { ChapterAstPlugin } from './plugins/ChapterAstPlugin';
import { StructurePlugin } from './plugins/StructurePlugin';

export interface Pipeline<T, S> {
    chapters: {
        astPlugins: Array<ChapterAstPlugin<T, S>>;
    };
    structure: {
        plugins: Array<StructurePlugin<T, S>>;
    };
}
