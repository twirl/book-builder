import { writeFileSync } from 'fs';
import htmlValidator from 'html-validator';

export default async function ({ html, htmlSourceValidator, out }) {
    if (htmlSourceValidator) {
        try {
            const result = await htmlValidator({
                ...htmlSourceValidator,
                data: html,
                isFragment: false
            });
            console.log(
                `HTML source valid.\nErrors: ${JSON.stringify(
                    result.errors,
                    null,
                    4
                )}\nWarnings: ${JSON.stringify(result.warnings, null, 4)}`
            );
        } catch (error) {
            console.error(
                `HTML source validation error: ${JSON.stringify(
                    error,
                    null,
                    4
                )}`
            );
        }
    }
    writeFileSync(out, html);
}
