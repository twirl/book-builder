import htmlValidator from 'html-validator';

import { HtmlPlugin } from '../../models/plugins/HtmlPlugin';

export const validator = (options?: any): HtmlPlugin => {
    return async (html, { context }) => {
        try {
            const result = await htmlValidator({
                ...(options ?? {}),
                data: html,
                isFragment: false
            });
            context.logger.debug(
                `HTML source valid.\nMessages: ${JSON.stringify(
                    result.messages,
                    null,
                    4
                )}`
            );
        } catch (error) {
            context.logger.error(
                `HTML source validation error: ${JSON.stringify(
                    error,
                    null,
                    4
                )}`
            );
        }
        return html;
    };
};
