import { Root } from 'hast';

import { Chapter } from '../models/Chapter';

export class Section {
    private chapters: Chapter[] = [];

    constructor(
        public readonly title: string,
        public readonly anchor: string,
        public readonly counter: number,
        public readonly content?: Root
    ) {}

    public appendChapter(chapter: Chapter) {
        this.chapters.push(chapter);
    }

    public getChapters() {
        return this.chapters;
    }
}
