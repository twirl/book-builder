import { Root } from 'hast';

import { Chapter } from '../models/Chapter';
import { Context } from '../models/Context';
import { L10n } from '../models/L10n';
import { ChapterAstPlugin } from '../models/plugins/ChapterAstPlugin';
import { Source } from '../models/Source';
import { Counters } from './helpers/Counters';
import { getSectionParametersFromSource } from './helpers/getSectionParametersFromSource';
import { getSectionWithChaptersFromParameters } from './helpers/getSectionWithChaptersFromParameters';

export class Structure {
    private sections: Section[] = [];
    constructor() {}

    public appendSection(section: Section) {
        this.sections.push(section);
    }

    public getSections() {
        return this.sections;
    }
}

export const getStructure = async (
    source: Source,
    context: Context
): Promise<Structure> => {
    const structure = new Structure();
    const counters = new Counters();

    const sectionParameters = await getSectionParametersFromSource(
        source,
        context
    );

    for (const parameters of sectionParameters) {
        structure.appendSection(
            await getSectionWithChaptersFromParameters(
                parameters,
                counters,
                context
            )
        );
    }

    return structure;
};

export class Section {
    private chapters: Chapter[] = [];

    constructor(
        public readonly title: string,
        public readonly anchor: string,
        public readonly counter: number,
        private content?: Root
    ) {}

    public getContent() {
        return this.content;
    }

    public setContent(content: Root) {
        this.content = content;
    }

    public appendChapter(chapter: Chapter) {
        this.chapters.push(chapter);
    }

    public getChapters() {
        return this.chapters;
    }

    public removeAllChapters() {
        this.chapters = [];
    }
}
