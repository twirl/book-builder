export const references = {
    appendTo: (structure, { l10n, templates }) => {
        let totalSources = 0;
        let totalRefs = 0;
        const sections = structure.sections;
        const sources = {};
        const preparedRefs = chaptersMap(sections, (chapter) => {
            return (chapter.references || []).reduce((refs, ref, index) => {
                let alias = ref.alias;

                if (alias) {
                    if (alias.at(0) == '{' && alias.at(-1) == '}') {
                        try {
                            const extra = JSON.parse(alias);
                            alias = extra.source && extra.source.alias;
                            if (alias) {
                                sources[alias] = extra.source;
                                refs.push({
                                    ...ref,
                                    ...extra,
                                    source: null,
                                    alias
                                });
                            } else {
                                refs.push({
                                    ...ref,
                                    ...extra,
                                    source: null,
                                    alias: null
                                });
                            }
                        } catch (e) {
                            throw new Error(`Cannot parse JSON ${alias}, ${e}`);
                        }
                    } else {
                        refs.push({
                            ...ref,
                            alias
                        });
                    }
                } else {
                    refs.push(ref);
                }

                return refs;
            }, []);
        });

        totalSources = Object.keys(sources).length;
        sections.forEach((section, i) => {
            if (section.chapters) {
                section.chapters.forEach((chapter, j) => {
                    const refs = preparedRefs[i] && preparedRefs[i].chapters[j];
                    let previousRef = null;
                    const items = [];
                    refs.forEach((ref) => {
                        totalRefs++;
                        const alias = ref.alias;
                        if (!alias) {
                            totalSources++;
                            items.push(
                                previousRef && ref.href == previousRef.href
                                    ? templates.referenceIbid(ref, l10n)
                                    : templates.referenceText(ref, l10n)
                            );
                        } else {
                            let text;
                            const source = sources[alias];
                            if (!source) {
                                throw new Error(`Unknown source ${alias}`);
                            } else if (
                                previousRef &&
                                previousRef.alias == alias &&
                                previousRef.href == ref.href
                            ) {
                                text = templates.referenceSourceIbid(
                                    ref,
                                    source,
                                    l10n,
                                    previousRef.page != ref.page
                                );
                            } else {
                                text = templates.referenceSourceFull(
                                    ref,
                                    source,
                                    l10n
                                );
                            }
                            items.push(text);
                        }
                        previousRef = ref;
                    });

                    chapter.content += items.length
                        ? templates.referenceList(items, l10n)
                        : '';
                });
            }
        });

        if (Object.keys(sources).length) {
            sections.push({
                anchor: 'bibliography',
                title: l10n.bibliography,
                content: templates.bibliography(
                    Object.values(sources).sort((a, b) => {
                        return a.short < b.short ? -1 : 1;
                    }),
                    l10n
                )
            });
        }

        structure.sources = totalSources;
        structure.references = totalRefs;
    }
};

function chaptersMap(sections, callback) {
    const result = [];
    sections.forEach((section, sectionIndex) => {
        result[sectionIndex] = { chapters: [] };
        section.chapters.forEach((chapter, chapterIndex) => {
            result[sectionIndex].chapters[chapterIndex] = callback(
                chapter,
                sectionIndex,
                chapterIndex
            );
        });
    });
    return result;
}
