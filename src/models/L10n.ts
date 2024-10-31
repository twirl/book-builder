import { Strings } from './Strings';
import { Templates } from './Templates';

export type L10n<T, S> = {
    language: string;
    locale: string;
    templates: Templates & T;
    strings: Strings & S;
};
