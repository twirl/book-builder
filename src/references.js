export const references = ({ sections }, { l10n, templates }) => {
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
    return {
        bibliography: {
            anchor: 'bibliography',
            title: l10n.bibliography,
            content: templates.bibliography(
                Object.values(sources).sort((a, b) => {
                    return a.short < b.short ? -1 : 1;
                }),
                l10n
            )
        },
        sections: chaptersMap(preparedRefs, (refs) => {
            let previousSource;
            const items = [];
            refs.forEach((ref) => {
                const alias = ref.alias;
                if (!alias) {
                    previousSource = null;
                    items.push(templates.referenceText(ref, l10n));
                } else {
                    let text;
                    const source = sources[alias];
                    if (!source) {
                        //throw new Error(`Unknown source ${alias}`);
                        text = 'Unknown source';
                    } else if (previousSource == alias) {
                        text = templates.referenceSourceIbid(ref, source, l10n);
                    } else {
                        text = templates.referenceSourceFull(ref, source, l10n);
                    }
                    previousSource = alias;
                    items.push(text);
                }
            });
            return items.length ? templates.referenceList(items, l10n) : null;
        })
    };
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
