import { Cache } from '../Cache';
import { Logger } from './Logger';
import { Options } from './Options';
import { Source } from './Source';

export interface Context {
    source: Source;
    options: Options;
    logger: Logger;
    cache: Cache;
}
