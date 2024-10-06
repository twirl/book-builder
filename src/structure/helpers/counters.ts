export class Counters {
    private sections = 0;
    private chapters = 0;
    private words = 0;
    private charactes = 0;

    constructor() {}

    public getChapterCountIncrement() {
        return ++this.chapters;
    }
}
