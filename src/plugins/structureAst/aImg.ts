import { ElementContent } from 'hast';

import { StructureAstState } from '../../models/plugins/StructureAstPlugin';
import { htmlToAstElements } from '../../preprocessors/html';
import { isElement } from '../../util/applyHastAstPlugin';
import { createStatelessPlugin } from '../../util/statelessPlugin';

export const aImg = <T, S>() =>
    createStatelessPlugin<StructureAstState<T, S>, ElementContent>(
        async (p: ElementContent, { l10n }: StructureAstState<T, S>) => {
            if (isElement(p) && p.children.length == 1) {
                const node = p.children[0];
                if (
                    isElement(node) &&
                    node.tagName == 'a' &&
                    node.children.length == 1
                ) {
                    const img = node.children[0];
                    if (isElement(img) && img.tagName == 'img') {
                        const size = (
                            img.properties.dataOriginalSrc ??
                            img.properties.src ??
                            ''
                        )
                            .toString()
                            .match(/\.(size-\w+)\./);

                        const nodes = await htmlToAstElements(
                            await l10n.templates.htmlAImg({
                                href: (node.properties.href ?? '').toString(),
                                src: (img.properties.src ?? '').toString(),
                                alt: (img.properties.alt ?? '').toString(),
                                title: (img.properties.title ?? '').toString(),
                                size: size ? size[1] : undefined
                            })
                        );
                        return { action: 'replace', newValue: nodes };
                    }
                }
            }
            return { action: 'continue_nested' };
        }
    );
