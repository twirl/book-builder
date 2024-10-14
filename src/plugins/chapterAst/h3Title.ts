import { Element } from 'hast';
import striptags from 'striptags';

import { Context } from '../../models/Context';
import {
    Action,
    ChapterAstPlugin,
    ChapterState
} from '../../models/plugins/AstPlugin';
import { Templates } from '../../models/Templates';
import { astNodeToHtml } from '../../util/astToHtml';

export class H3TitlePlugin implements ChapterAstPlugin {
    private readonly h3Contents: string[] = [];
    constructor(
        private readonly templates: Templates,
        private readonly context: Context
    ) {}
    public async init() {}
    public async run(node: Element): Promise<Action> {
        if (node.tagName === 'h3') {
            this.h3Contents.push(striptags(await astNodeToHtml(node)));
            return { action: 'continue' };
        }
        return { action: 'continue_nested' };
    }
    public async finish(state: ChapterState) {
        if (this.h3Contents.length) {
            state.title = this.templates.chapterTitle(
                state.path,
                state.counter,
                this.context,
                this.h3Contents
            );
        }
    }
}
