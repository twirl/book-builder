import { DefaultTemplates } from '../templates/Templates';
import { CssClasses } from './CssClasses';
import { Strings } from './Strings';

export type Templates<S = Strings, C = CssClasses> = S extends Strings
    ? C extends CssClasses
        ? DefaultTemplates<S, C>
        : never
    : never;
