import { resolve } from 'node:path';

import datauri from 'datauri';
import { ElementContent } from 'hast';

import { Action } from '../../models/AstPlugin';
import { ChapterState } from '../../models/plugins/ChapterAstPlugin';
import { createStatelessPlugin } from '../../util/statelessPlugin';

export const dataUri = <T, S>(
    matchers: DataUriPluginMatchers = DEFAULT_MATCHERS
) => {
    return createStatelessPlugin<'chapter_ast_plugin', ChapterState<T, S>>(
        'chapter_ast_plugin',
        async (node, state): Promise<Action> => {
            for (const matcher of Object.values(matchers)) {
                const match = matcher(node);
                if (match !== null) {
                    const dataUriValue = await datauri(
                        resolve(
                            state.context.source.base,
                            ...match.url.split('/')
                        )
                    );
                    if (dataUriValue) {
                        match.setter(dataUriValue);
                    } else {
                        state.context.logger.error(
                            'Cannot make a data URI',
                            node
                        );
                    }
                }
            }
            return { action: 'continue_nested' };
        }
    );
};

export interface DataUriPluginMatchers {
    [name: string]: (
        node: ElementContent
    ) => { setter: (dataUri: string) => void; url: string } | null;
}

export const DEFAULT_MATCHERS: DataUriPluginMatchers = {
    linkRelIcon: (node: ElementContent) => {
        if (node.type === 'element' && node.tagName === 'link') debugger;
        if (
            node.type === 'element' &&
            node.tagName === 'link' &&
            node.properties.rel === 'icon'
        ) {
            const url = node.properties.href;
            if (typeof url === 'string') {
                return {
                    url,
                    setter: (dataUri: string) => {
                        node.properties.href = dataUri;
                    }
                };
            }
        }
        return null;
    }
};
