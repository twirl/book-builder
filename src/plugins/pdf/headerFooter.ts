import { PdfPlugin, PdfPluginState } from '../../models/plugins/PdfPlugin';

export const headerFooter = (): PdfPlugin => {
    return async <T, S>(state: PdfPluginState<T, S>) => {
        console.log('It works!');
    };
};
