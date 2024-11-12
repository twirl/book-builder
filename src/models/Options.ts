import { LogLevel } from './Logger';

export interface Options {
    tmpDir: string;
    noCache: boolean;
    logLevel: LogLevel;
    generateTableOfContents: boolean;
    chapterRange?: [number, number];
    sample: boolean;
}
