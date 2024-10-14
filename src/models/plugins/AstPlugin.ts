import { Element, ElementContent } from 'hast';

export interface AstPlugin<State> {
    init: (state: State) => Promise<void>;
    run: (input: Element) => Promise<Action>;
    finish: (state: State) => Promise<void>;
}

export type Action = ContinueAction | ContinueNestedAction | ReplaceAction;

export interface ContinueAction {
    action: 'continue';
}

export interface ContinueNestedAction {
    action: 'continue_nested';
}

export interface ReplaceAction {
    action: 'replace';
    newValue: ElementContent | ElementContent[];
}

export type PluginState = Record<string, any>;

export interface ChapterState {
    counter: number;
    title: string;
    anchor: string;
    path: string;
}

export type ChapterAstPlugin = AstPlugin<ChapterState>;
