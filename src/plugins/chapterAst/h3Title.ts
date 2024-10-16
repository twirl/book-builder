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

export const h3Title = <T, S>(l10n: L10n<T, S>, context: Context) =>
    new H3TitlePlugin(l10n, context);

export class H3TitlePlugin<T, S> implements ChapterAstPlugin<T, S> {
    private readonly h3Contents: string[] = [];
    constructor(
        private readonly l10n: L10n<T, S>,
        private readonly context: Context
    ) {}
    public async init() {
        return this;
    }
    public async run(node: Element): Promise<Action> {
        if (node.tagName === 'h3') {
            this.h3Contents.push(striptags(await astNodeToHtml(node)));
            return { action: 'continue' };
        }
        return { action: 'continue_nested' };
    }
    public async finish(state: ChapterState<T, S>) {
        if (this.h3Contents.length) {
            state.title = this.l10n.templates.chapterTitle(
                state.path,
                state.counter,
                this.context,
                this.h3Contents
            );
        }
    }
}
