import { Builder } from '../../models/Builder';
import { HtmlBuilderOptions } from './HtmlBuilder';

export type EpubBuilder<T, S> = Builder<T, S, EpubBuilderOptions, 'epub'>;

export type EpubBuilderOptions = HtmlBuilderOptions
