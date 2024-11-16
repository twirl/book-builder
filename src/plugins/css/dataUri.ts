import { resolve } from 'node:path';

import { CssNode } from 'css-tree';
import datauri from 'datauri';

import { CssPluginState } from '../../models/plugins/CssAstPlugin';
import { createStatelessPlugin } from '../../util/statelessPlugin';

export const dataUri = <T, S>(options: Partial<DataUriPluginOptions> = {}) => {
    const resolvedOptions = {
        ...DEFAULT_OPTIONS,
        ...options
    };
    return createStatelessPlugin<CssPluginState<T, S>, CssNode>(
        async (input, state) => {
            if (
                'block' in input &&
                input.block !== null &&
                'children' in input.block
            ) {
                for (const item of input.block.children.toArray()) {
                    if (
                        item.type === 'Declaration' &&
                        resolvedOptions.properties.has(item.property) &&
                        item.value.type === 'Value'
                    ) {
                        for (const value of item.value.children.toArray()) {
                            if (value.type === 'Url') {
                                const data = await datauri(
                                    resolve(
                                        state.context.source.base,
                                        ...value.value.split('/')
                                    )
                                );
                                if (data) {
                                    value.value = data;
                                }
                            }
                        }
                    }
                }
            }
            return { action: 'continue_nested' };
        }
    );
};

export interface DataUriPluginOptions {
    properties: Set<string>;
}

export const DEFAULT_OPTIONS: DataUriPluginOptions = {
    properties: new Set(['src'])
};
