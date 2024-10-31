import { Element } from 'hast';
import striptags from 'striptags';

import { Action } from '../../models/AstPlugin';
import { Context } from '../../models/Context';
import { L10n } from '../../models/L10n';
import {
    ChapterAstPlugin,
    ChapterState
} from '../../models/plugins/ChapterAstPlugin';
import { astNodeToHtml } from '../../util/astToHtml';

export const h3Title = () => new H3TitlePlugin();

export class H3TitlePlugin<T, S> implements ChapterAstPlugin<T, S> {
    private readonly h3Contents: string[] = [];

    constructor() {}

    public async init() {
        return this;
    }

    public async run(node: Element): Promise<Action> {
        if (node.tagName === 'h3') {
            this.h3Contents.push(striptags(await astNodeToHtml(node)));
            return this.h3Contents.length === 1
                ? { action: 'replace', newValue: [] }
                : { action: 'continue' };
        }
        return { action: 'continue_nested' };
    }
    public async finish(state: ChapterState<T, S>) {
        if (this.h3Contents.length) {
            state.chapter.title = state.l10n.templates.jointHeaders(
                this.h3Contents
            );
        }
    }
}
