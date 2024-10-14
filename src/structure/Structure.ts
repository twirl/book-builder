import { Section } from './Section';

export class Structure {
    private sections: Section[] = [];
    constructor() {}

    public appendSection(section: Section) {
        this.sections.push(section);
    }
}

export async function getStructure(
    source: Source,
    context: Context,
    templates: Templates
) {
    const structure = {
        sections: []
    };
    const counters = new Counters();
    // const plugins = (pipeline && pipeline.ast && pipeline.ast.preProcess) || [];
    const sectionParameters = await getSectionParametersFromSource(
        source,
        context,
        templates
    );

    for (const parameters of sectionParameters) {
        structure.sections.push(
            await getSectionWithChaptersFromParameters(
                parameters,
                counters,
                templates,
                context
            )
        );
    }

    await readdirSync(path)
        .filter((p) => statSync(resolve(path, p)).isDirectory())
        .sort()
        .reduce(async (p, dir, index) => {
            const structure = await p;
            const name = dir.replace(/^[^\-]*-/, '');
            const subdir = resolve(path, dir);
            const section = {
                title: name,
                anchor: `section-${index + 1}`,
                filename: `section-${index + 1}.xhtml`,
                chapters: []
            };

            
    return structure;
}

export interface Cursor {
    section: number;
    chapter: number;
    references: number;
    words: number;
}

public static async createFromMarkdown(
    filename: string,
    templates: Templates,
    context: Context,
    cursor: Cursor,
    plugins: AstPlugin[]
) {
    const md = await readFile(filename, 'utf-8');
    const anchor = filename
        .toLowerCase()
        .replace(/^\d+\-/, '')
        .replace(/\.\w+$/, '');
    const ast = await markdownToAst(md);
    return new Chapter(ast, anchor, ++cursor.chapter);
}
