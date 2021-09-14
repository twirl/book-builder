export const references = ({ references }, { l10n, templates }) => {
    if (!references.length) {
        return null;
    }

    const { sources, preparedRefs } = references.reduce(
        ({ sources, preparedRefs }, ref) => {
            let alias = ref.alias;

            if (alias) {
                if (alias.at(0) == '{' && alias.at(-1) == '}') {
                    try {
                        const extra = JSON.parse(alias);
                        alias = extra.source && extra.source.alias;
                        if (alias) {
                            sources[alias] = extra.source;
                            preparedRefs.push({
                                ...ref,
                                ...extra,
                                source: null,
                                alias
                            });
                        } else {
                            preparedRefs.push({
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
                    preparedRefs.push({
                        ...ref,
                        alias
                    });
                }
            } else {
                preparedRefs.push(ref);
            }
            return { sources, preparedRefs };
        },
        { sources: {}, preparedRefs: [] }
    );

    let previousSource;
    preparedRefs.forEach(({ alias, counter, backAnchor }) => {
        if (alias && sources[alias]) {
            if (!sources[alias].refs) {
                sources[alias].refs = [];
            }
            sources[alias].refs.push({ counter, backAnchor });
        }
    });
    return [
        {
            anchor: 'bibliography',
            title: l10n.bibliography,
            content: templates.bibliography(
                Object.values(sources).sort((a, b) => {
                    return a.short < b.short ? -1 : 1;
                }),
                l10n
            )
        },
        {
            anchor: 'references',
            title: l10n.references,
            content: templates.referenceList(
                preparedRefs.map((ref) => {
                    const alias = ref.alias;
                    if (!alias) {
                        previousSource = null;
                        return templates.referenceText(ref, l10n);
                    } else {
                        let text;
                        const source = sources[alias];
                        if (!source) {
                            //throw new Error(`Unknown source ${alias}`);
                            text = 'Unknown source';
                        } else if (previousSource == alias) {
                            text = templates.referenceSourceIbid(
                                ref,
                                source,
                                l10n
                            );
                        } else {
                            text = templates.referenceSourceFull(
                                ref,
                                source,
                                l10n
                            );
                        }
                        previousSource = alias;
                        return text;
                    }
                }),
                l10n
            )
        }
    ];
};
