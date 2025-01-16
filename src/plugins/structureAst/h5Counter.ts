import { ElementContent } from 'hast';

import { Action } from '../../models/AstPlugin';
import {
    StructureAstPlugin,
    StructureAstState
} from '../../models/plugins/StructureAstPlugin';
import { htmlToAstElements } from '../../preprocessors/html';

export const h5Counter = <T, S>(): StructureAstPlugin<T, S> => {
    return {
        init: async (state) => new H5CounterPlugin<T, S>(state)
    };
};

export class H5CounterPlugin<T, S> {
    private counter = 0;
    private iteration = 1;

    constructor(private readonly state: StructureAstState<T, S>) {}

    public async run(node: ElementContent): Promise<Action<ElementContent>> {
        if (node.type === 'element' && node.tagName === 'h5') {
            const contentElement = node.children[0];
            if (contentElement?.type === 'text') {
                let content = contentElement.value.trim();
                const match = content.match(/^(\d+)\.\s*/);
                if (match) {
                    this.counter = Number(match[1]);
                    content = content.slice(match[0].length);
                    this.iteration++;
                } else {
                    this.counter++;
                }

                return {
                    action: 'replace',
                    newValue: await htmlToAstElements(
                        await this.state.l10n.templates.htmlH5Counter(
                            this.counter,
                            this.iteration,
                            content,
                            this.state.chapter,
                            this.state.section
                        )
                    )
                };
            }
        }
        return { action: 'continue_nested' };
    }

    public async finish() {}
}
