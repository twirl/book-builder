import { Node } from 'hast';

export interface AstPlugin<T> {
    init: () => Promise<T>;
    run: (input: Node, state: T) => Promise<Action<T>>;
}

export type Action<T> = ContinueAction<T> | ReplaceAction<T>;

export enum ActionType {
    CONTINUE = 'continue',
    REPLACE = 'replace'
}

export interface BaseAction<T> {
    action: ActionType;
    state: T;
}

export interface ContinueAction<T> extends BaseAction<T> {
    action: ActionType.CONTINUE;
}

export interface ReplaceAction<T> extends BaseAction<T> {
    action: ActionType.REPLACE;
    newValue: Node;
}
