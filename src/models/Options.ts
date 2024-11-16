import { LogLevel } from './Logger';

export interface Options {
    tmpDir: string;
    noCache: boolean;
    logLevel: LogLevel;
    chapterRange?: [number, number];
    sample: boolean;
}
