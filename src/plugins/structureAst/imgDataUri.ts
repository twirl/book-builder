import { resolve } from 'node:path';

import datauri from 'datauri';
import { ElementContent } from 'hast';

import { StructureAstState } from '../../models/plugins/StructureAstPlugin';
import { isElement } from '../../util/applyHastAstPlugin';
import { createStatelessPlugin } from '../../util/statelessPlugin';

export const imgDataUri = <T, S>() =>
    createStatelessPlugin<StructureAstState<T, S>, ElementContent>(
        async (node: ElementContent, state: StructureAstState<T, S>) => {
            if (
                isElement(node) &&
                node.tagName === 'img' &&
                typeof node.properties.src === 'string'
            ) {
                node.properties.dataOriginalSrc = node.properties.src;
                node.properties.src = await datauri(
                    resolve(
                        state.context.source.base,
                        ...node.properties.src.split('/')
                    )
                );
                return {
                    action: 'continue'
                };
            }
            return {
                action: 'continue_nested'
            };
        }
    );
