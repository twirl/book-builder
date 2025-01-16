import { LogLevel } from './Logger';
import { Path } from './Types';

export interface Options {
    tmpDir: Path;
    noCache: boolean;
    purgeCache: boolean;
    logLevel: LogLevel;
    chapterRange?: [number, number];
    sample: boolean;
}
