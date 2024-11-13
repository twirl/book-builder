import { ElementContent } from 'hast';

import { Action, AstPlugin } from '../models/AstPlugin';

export function createStatelessPlugin<
    Type extends string,
    T,
    C = ElementContent
>(
    type: Type,
    runner: (input: C, state: T, options: undefined) => Promise<Action<C>>
): AstPlugin<T, C> & {
    type: Type;
};

export function createStatelessPlugin<
    Type extends string,
    T,
    O,
    C = ElementContent
>(
    type: T,
    runner: (input: C, state: T, options: O) => Promise<Action<C>>,
    options: O
): AstPlugin<T, C> & {
    type: Type;
};

export function createStatelessPlugin<T, O, C = ElementContent>(
    type: string,
    runner: (input: C, state: T, options?: O) => Promise<Action<C>>,
    options?: O
): AstPlugin<T, C> & { type: typeof type } {
    return {
        type,
        init: async (state: T) => ({
            run: (input: C) => runner(input, state, options),
            finish: async () => {}
        })
    };
}
