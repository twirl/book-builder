import puppeteer from 'puppeteer';
import htmlValidator from 'html-validator';

export default async function ({
    out,
    html,
    htmlSourceValidator,
    templates,
    l10n
}) {
    if (htmlSourceValidator) {
        try {
            const result = await htmlValidator({
                ...htmlSourceValidator,
                data: html,
                isFragment: false
            });
            console.log(
                `PDF source valid.\nErrors: ${JSON.stringify(
                    result.errors,
                    null,
                    4
                )}\nWarnings: ${JSON.stringify(result.warnings, null, 4)}`
            );
        } catch (error) {
            console.error(
                `PDF source validation error: ${JSON.stringify(error, null, 4)}`
            );
        }
    }

    const browser = await puppeteer.launch({
        headless: 'new',
        product: 'chrome'
    });
    const page = await browser.newPage();

    await page.setContent(html, {
        waitUntil: 'networkidle0'
    });

    const headerTemplate = templates.headerTemplate
        ? templates.headerTemplate(l10n)
        : '<div></div>';
    const footerTemplate = templates.footerTemplate
        ? templates.footerTemplate(l10n)
        : '<div></div>';

    await page.pdf({
        path: out,
        preferCSSPageSize: true,
        printBackground: true,
        timeout: 0,
        displayHeaderFooter: true,
        headerTemplate,
        footerTemplate
    });

    await browser.close();
}
