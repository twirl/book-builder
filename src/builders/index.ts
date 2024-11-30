import {
    EpubBuilder,
    EpubBuilderOptions
} from '../models/builders/EpubBuilder';
import {
    HtmlBuilder,
    HtmlBuilderOptions
} from '../models/builders/HtmlBuilder';
import { PdfBuilder, PdfBuilderOptions } from '../models/builders/PdfBuilder';
import { EpubPlugin } from '../models/plugins/EpubPlugin';
import { HtmlPlugin } from '../models/plugins/HtmlPlugin';
import { PdfPlugin } from '../models/plugins/PdfPlugin';

export interface BuilderMap<T, S> {
    html: HtmlBuilder<T, S>;
    epub: EpubBuilder<T, S>;
    pdf: PdfBuilder<T, S>;
}

export interface BuilderOptionsMap {
    html: HtmlBuilderOptions;
    epub: EpubBuilderOptions;
    pdf: PdfBuilderOptions;
}

export interface BuilderPluginMap {
    html: HtmlPlugin;
    epub: EpubPlugin;
    pdf: PdfPlugin;
}

export type RegisteredBuilder<T, S> = BuilderMap<T, S>[keyof BuilderMap<T, S>];
export type RegisteredBuilderOptions =
    BuilderOptionsMap[keyof BuilderOptionsMap];
export type RegisteredBuilderPlugin = BuilderPluginMap[keyof BuilderPluginMap];
