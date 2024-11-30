import { Root } from 'hast';

import { Chapter } from '../models/Chapter';
import { getContentModificationTime } from '../util/modificationTime';

export class Section {
    private chapters: Chapter[] = [];

    constructor(
        public readonly anchor: string,
        public readonly title?: string,
        private counter?: number,
        private content?: Root,
        private skipTableOfContents = false,
        private contentModificationTimeMs: number | null = null
    ) {}

    public getContent() {
        return this.content;
    }

    public setContent(content: Root, contentModificationTimeMs?: number) {
        this.content = content;
        if (contentModificationTimeMs !== undefined) {
            this.contentModificationTimeMs = contentModificationTimeMs;
        }
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

    public getContentModificationTimeMs(): number | null {
        return getContentModificationTime(
            this.getChapters(),
            (chapter) => chapter.modificationTimeMs,
            this.contentModificationTimeMs
        );
    }
}
