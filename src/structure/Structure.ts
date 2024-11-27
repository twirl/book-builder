import { Root } from 'hast';

import { Chapter } from '../models/Chapter';
import { Context } from '../models/Context';
import { Source } from '../models/Source';
import { Counters } from './helpers/Counters';
import { getSectionParametersFromSource } from './helpers/getSectionParametersFromSource';
import { getSectionWithChaptersFromParameters } from './helpers/getSectionWithChaptersFromParameters';

export class Structure {
    private sections: Section[] = [];
    constructor(private readonly counters: Counters) {}

    public appendSection(section: Section) {
        section.setCounter(this.counters.getSectionCountIncremented());
        this.sections.push(section);
    }

    public prependSection(section: Section, position: number) {
        this.sections.splice(position, 0, section);
    }

    public getSections() {
        return this.sections;
    }
}

export const getStructure = async (
    source: Source,
    context: Context
): Promise<Structure> => {
    const counters = new Counters();
    const structure = new Structure(counters);

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
        public readonly anchor: string,
        public readonly title?: string,
        private counter?: number,
        private content?: Root,
        private skipTableOfContents = false
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

    public inTableOfContents() {
        return !this.skipTableOfContents;
    }

    public getCounter() {
        return this.counter;
    }

    public setCounter(counter?: number) {
        this.counter = counter;
    }
}
