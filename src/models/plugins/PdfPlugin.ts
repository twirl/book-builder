import { Structure } from '../../structure/Structure';
import { BuilderState } from '../Builder';
import { Path } from '../Types';

export type PdfPlugin = <T, S>(state: PdfPluginState<T, S>) => Promise<Path>;

export interface PdfPluginState<T, S> extends BuilderState<T, S> {
    sourceFile: Path;
    structure: Structure;
}
