import { ElementContent } from 'hast';

export interface AstPlugin<State, C = ElementContent> {
    init: (state: State) => Promise<AstPluginRunner<State, C>>;
}

export interface AstPluginRunner<State, C = ElementContent> {
    run: (input: C) => Promise<Action<C>>;
    finish: (state: State) => Promise<void>;
}

export type Action<C = ElementContent> =
    | ContinueAction
    | ContinueNestedAction
    | ReplaceAction<C>;

export interface ContinueAction {
    action: 'continue';
}

export interface ContinueNestedAction {
    action: 'continue_nested';
}

export interface ReplaceAction<C = ElementContent> {
    action: 'replace';
    newValue: C | C[];
}
