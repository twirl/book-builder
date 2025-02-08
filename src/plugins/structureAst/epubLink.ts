import { ElementContent } from 'hast';

import { StructureAstState } from '../../models/plugins/StructureAstPlugin';
import { isElement } from '../../util/applyHastAstPlugin';
import { escapeHtml } from '../../util/escapeHtml';
import { createStatelessPlugin } from '../../util/statelessPlugin';

export const epubLink = <T, S>(epubChapterIndex: Map<string, string>) =>
    createStatelessPlugin<StructureAstState<T, S>, ElementContent>(
        async (
            node: ElementContent,
            _context,
            state: StructureAstState<T, S>
        ) => {
            if (isElement(node) && node.tagName === 'a') {
                const { href } = node.properties;
                if (typeof href === 'string' && href.startsWith('#')) {
                    const path = matchPath(epubChapterIndex, href.slice(1));
                    if (path) {
                        node.properties.href = `${escapeHtml(path)}${href}`;
                        state.context.logger.debug(
                            'EPUB link converted',
                            href,
                            node.properties.href
                        );
                        return {
                            action: 'continue'
                        };
                    } else {
                        state.context.logger.error(
                            'Cannot process internal reference',
                            href
                        );
                    }
                }
            }
            return {
                action: 'continue_nested'
            };
        }
    );

export const matchPath = (
    epubChapterIndex: Map<string, string>,
    fragment: string
) => {
    const fullMatch = epubChapterIndex.get(fragment);
    if (fullMatch) {
        return fullMatch;
    } else {
        for (const [prefix, path] of epubChapterIndex) {
            if (fragment.startsWith(prefix)) {
                return path;
            }
        }
    }
};
