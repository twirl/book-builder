import { Context } from '../models/Context';
import { Logger } from '../models/Logger';
import { Options } from '../models/Options';
import { Source } from '../models/Source';
import { Templates } from '../models/Templates';

export class Structure {
    private cursor = {
        sections: 0,
        references: 0,
        words: 0,
        characters: 0
    };
    private sections: Section[] = [];
    constructor(
        private readonly templates: Templates,
        private readonly context: Context
    ) {}
}

export class Section {
    private chapters: Chapter = [];
    constructor() {}
}

export class Chapter {
    constructor() {}

    public static async createFromMarkdown(
        md: string,
        templates: Templates,
        context: Context,
        cursor: Cursor
    ) {
        const {ast, cursor} = await markdownPreProcess(md);
        return new Chapter(ast);
    }

    public static
}

export interface Cursor {
    section: number;
    chapter: number;
    references: number;
    words: number;
}
