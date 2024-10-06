import { Cache } from '../Cache';
import { L10n } from './L10n';
import { Logger } from './Logger';
import { Options } from './Options';

export interface Context {
    l10n: L10n;
    options: Options;
    logger: Logger;
    cache: Cache;
}
