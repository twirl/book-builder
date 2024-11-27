import { resolve } from 'node:path';

import { ElementContent } from 'hast';

import { StructureAstState } from '../../models/plugins/StructureAstPlugin';
import { isElement } from '../../util/applyHastAstPlugin';
import { createStatelessPlugin } from '../../util/statelessPlugin';

export const imgSrcToFileUrl = <T, S>(base: string) =>
    createStatelessPlugin<StructureAstState<T, S>, ElementContent>(
        async (node: ElementContent, state: StructureAstState<T, S>) => {
            if (
                isElement(node) &&
                node.tagName === 'img' &&
                typeof node.properties.src === 'string' &&
                node.properties.src.startsWith('/')
            ) {
                node.properties.src = `file://${resolve(base, node.properties.src.slice(1))}`;
                return { action: 'continue' };
            }
            return { action: 'continue_nested' };
        }
    );
