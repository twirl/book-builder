import { CssClasses } from './CssClasses';
import { Strings } from './Strings';
import { Templates } from './Templates';

export type L10n<T, S = Strings, C = CssClasses> =
    T extends Templates<S, C>
        ? {
              language: string;
              locale: string;
              templates: T;
              strings: S;
          }
        : never;
