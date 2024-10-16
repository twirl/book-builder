import { Element } from 'hast';

import { Action, AstPlugin } from '../models/AstPlugin';

export function createStatelessPlugin<T>(
    runner: (input: Element, state: T, options: undefined) => Promise<Action>
): AstPlugin<T>;

export function createStatelessPlugin<T, O>(
    runner: (input: Element, state: T, options: O) => Promise<Action>,
    options: O
): AstPlugin<T>;

export function createStatelessPlugin<T, O>(
    runner: (input: Element, state: T, options?: O) => Promise<Action>,
    options?: O
): AstPlugin<T> {
    return {
        init: async (state: T) => ({
            run: (input: Element) => runner(input, state, options),
            finish: async () => {}
        })
    };
}
