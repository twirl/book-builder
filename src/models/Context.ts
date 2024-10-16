import { Cache } from '../Cache';
import { Logger } from './Logger';
import { Options } from './Options';

export interface Context {
    options: Options;
    logger: Logger;
    cache: Cache;
}
