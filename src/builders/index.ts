import { HtmlPlugin } from '../models/plugins/HtmlPlugin';
import { HtmlBuilder, HtmlBuilderOptions } from './html/HtmlBuilder';

export interface BuilderMap<T, S> {
    html: HtmlBuilder<T, S>;
}

export interface BuilderOptionsMap {
    html: HtmlBuilderOptions;
}

export interface BuilderPluginMap {
    html: HtmlPlugin;
}

export type RegisteredBuilder<T, S> = BuilderMap<T, S>[keyof BuilderMap<T, S>];
export type RegisteredBuilderOptions =
    BuilderOptionsMap[keyof BuilderOptionsMap];
export type RegisteredBuilderPlugin = BuilderPluginMap[keyof BuilderPluginMap];
