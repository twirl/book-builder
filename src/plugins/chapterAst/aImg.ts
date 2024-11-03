import { Element } from 'hast';

import { ChapterState } from '../../models/plugins/ChapterAstPlugin';
import { htmlToAstElements } from '../../preprocessors/html';
import { isElement } from '../../util/applyHastAstPlugin';
import { createStatelessPlugin } from '../../util/statelessPlugin';

export const aImg = <T, S>() =>
    createStatelessPlugin<ChapterState<T, S>>(
        async (p: Element, { l10n }: ChapterState<T, S>) => {
            if (p.children && p.children.length == 1) {
                const node = p.children[0];
                if (
                    isElement(node) &&
                    node.tagName == 'a' &&
                    node.children &&
                    node.children.length == 1
                ) {
                    const img = node.children[0];
                    if (isElement(img) && img.tagName == 'img') {
                        const size = (img.properties.src ?? '')
                            .toString()
                            .match(/\.(size-\w+)\./);

                        const nodes = await htmlToAstElements(
                            l10n.templates.html.aImg({
                                href: (node.properties.href ?? '').toString(),
                                src: (img.properties.src ?? '').toString(),
                                alt: (img.properties.alt ?? '').toString(),
                                title: (img.properties.title ?? '').toString(),
                                size: size ? size[1] : undefined,
                                l10n
                            })
                        );
                        return { action: 'replace', newValue: nodes };
                    }
                }
            }
            return { action: 'continue_nested' };
        }
    );
