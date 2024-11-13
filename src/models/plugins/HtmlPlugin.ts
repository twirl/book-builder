import { BuilderState } from '../Builder';

export type HtmlPlugin = HtmlPluginCallback & {
    type: 'html_plugin';
};

export type HtmlPluginCallback = <T, S>(
    html: string,
    state: BuilderState<T, S>
) => Promise<string>;
