import { ElementContent } from 'hast';
import striptags from 'striptags';

import { Action } from '../../models/AstPlugin';
import {
    ChapterAstPlugin,
    ChapterState
} from '../../models/plugins/ChapterAstPlugin';
import { astNodeToHtml } from '../../util/astToHtml';

export const h3Title = <T, S>(): ChapterAstPlugin<T, S> => {
    return {
        init: async () => new H3TitlePlugin<T, S>()
    };
};

export class H3TitlePlugin<T, S> {
    private readonly h3Contents: string[] = [];

    constructor() {}

    public async run(node: ElementContent): Promise<Action<ElementContent>> {
        if (node.type === 'element' && node.tagName === 'h3') {
            this.h3Contents.push(striptags(await astNodeToHtml(node)));
            return this.h3Contents.length === 1
                ? { action: 'replace', newValue: [] }
                : { action: 'continue' };
        }
        return { action: 'continue_nested' };
    }

    public async finish(state: ChapterState<T, S>) {
        if (this.h3Contents.length) {
            state.chapter.title = state.l10n.templates.jointTitle(
                this.h3Contents
            );
        }
    }
}
