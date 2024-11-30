import muhammara from 'muhammara';

import { BuilderState } from '../Builder';

export type PdfPlugin = <T, S>(state: PdfPluginState<T, S>) => Promise<void>;

export interface PdfPluginState<T, S> extends BuilderState<T, S> {
    reader: muhammara.PDFReader;
    writer: muhammara.PDFWriter;
}
