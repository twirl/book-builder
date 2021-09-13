import puppeteer from 'puppeteer';

export default async function ({ out, html }) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setContent(html, {
        waitUntil: 'networkidle0'
    });
    await page.pdf({
        path: out,
        preferCSSPageSize: true,
        printBackground: true
    });

    await browser.close();
}
