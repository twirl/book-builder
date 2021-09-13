export const references = ({ references }, { l10n, templates }) => {
    if (!references.length) {
        return null;
    }

    const { sources, preparedRefs } = references.reduce(
        ({ sources, preparedRefs }, ref) => {
            const { text, href, backAnchor } = ref;
            if (!text && href) {
                preparedRefs.push(ref);
            } else if (text) {
                const match = text.match(/^([a-z\d-]+)(:{.+})?(:[\d,-\s]+)?$/);
                if (!match) {
                    preparedRefs.push(ref);
                    return { sources, preparedRefs };
                }
                const [alias, json, page] = match.slice(1);
                if (json) {
                    try {
                        const res = JSON.parse(json.slice(1));
                        sources[alias] = {
                            author: '',
                            year: '',
                            ...res,
                            href,
                            alias
                        };
                    } catch (e) {
                        throw new Error(`Cannot parse JSON ${json}`);
                    }
                }
                preparedRefs.push({
                    ...ref,
                    alias,
                    page: page && page.slice(1)
                });
            } else {
                throw new Error(`Cannot parse reference #${backAnchor}`);
            }
            return { sources, preparedRefs };
        },
        { sources: {}, preparedRefs: [] }
    );

    let previousSource;
    return [
        {
            anchor: 'bibliography',
            title: l10n.bibliography,
            content: templates.bibliography(
                Object.values(sources).sort((a, b) => {
                    return a.author == b.author
                        ? a.year == b.year
                            ? a.title < b.title
                                ? -1
                                : 1
                            : a.year < b.year
                            ? -1
                            : 1
                        : a.author < b.author
                        ? -1
                        : 1;
                }),
                l10n
            )
        },
        {
            anchor: 'references',
            title: l10n.references,
            content: templates.referenceList(
                preparedRefs.map((ref) => {
                    const { alias } = ref;
                    if (!alias) {
                        previousSource = null;
                        return {
                            text: ref.text || href,
                            ...ref
                        };
                    } else {
                        let source = sources[alias];
                        if (!source) {
                            //throw new Error(`Unknown source ${alias}`);
                            source = {
                                author: 'unknown',
                                title: 'unknown',
                                alias: 'unknown'
                            };
                        }
                        let text;
                        if (previousSource == alias) {
                            text = templates.referenceTextIbid(l10n);
                        } else {
                            text = templates.referenceTextAlias(source, l10n);
                        }
                        previousSource = alias;
                        return {
                            ...ref,
                            text
                        };
                    }
                }),
                l10n
            )
        }
    ];
};
