import { Action, AstContext, AstPlugin } from '../models/AstPlugin';

export function createStatelessPlugin<T, C>(
    runner: (
        input: C,
        context: AstContext<C>,
        state: T,
        options: undefined
    ) => Promise<Action<C>>
): AstPlugin<T, C>;

export function createStatelessPlugin<T, O, C>(
    runner: (
        input: C,
        context: AstContext<C>,
        state: T,
        options: O
    ) => Promise<Action<C>>,
    options: O
): AstPlugin<T, C>;

export function createStatelessPlugin<T, O, C>(
    runner: (
        input: C,
        context: AstContext<C>,
        state: T,
        options?: O
    ) => Promise<Action<C>>,
    options?: O
): AstPlugin<T, C> {
    return {
        init: async (state: T) => ({
            run: (input: C, context: AstContext<C>) =>
                runner(input, context, state, options),
            finish: async () => {}
        })
    };
}
