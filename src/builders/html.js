import { writeFileSync } from 'fs';

export default async function ({ html, out }) {
    writeFileSync(out, html);
}
