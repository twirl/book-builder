import { ConfigData, HtmlValidate, Message, RuleConfig } from 'html-validate';

import { HtmlPlugin } from '../../models/plugins/HtmlPlugin';

export const DEFAULT_OPTIONS: ConfigData = {
    extends: ['html-validate:document'],
    rules: {
        'heading-level': 'off',
        'require-sri': 'off'
    }
};

export const validator = (rules: RuleConfig = {}): HtmlPlugin => {
    return async (html, { context }) => {
        try {
            const validator = new HtmlValidate({
                ...DEFAULT_OPTIONS,
                rules: {
                    ...DEFAULT_OPTIONS.rules,
                    ...rules
                }
            });
            const result = await validator.validateString(html);
            if (result.valid) {
                context.logger.debug(
                    `HTML source valid.\nMessages: ${getValidatorMessages(result)}`
                );
            } else {
                context.logger.error(
                    `HTML source validation error: ${getValidatorMessages(result)}`
                );
            }
        } catch (error) {
            context.logger.error('Cannot validate HTML', error);
        }
        return html;
    };

    function getValidatorMessages(
        result: Awaited<
            ReturnType<typeof HtmlValidate.prototype.validateString>
        >
    ): string {
        return JSON.stringify(
            result.results.reduce((acc, r) => {
                return acc.concat(r.messages);
            }, [] as Message[]),
            null,
            4
        );
    }
};
