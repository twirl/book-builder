export class Counters {
    private sections = 0;
    private chapters = 0;

    constructor() {}

    public getChapterCountIncremented() {
        return ++this.chapters;
    }

    public getChapterCount() {
        return this.chapters;
    }

    public getSectionCountIncremented() {
        return ++this.sections;
    }
}
