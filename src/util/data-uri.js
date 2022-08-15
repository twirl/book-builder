import DatauriParser from 'datauri/parser.js';
import axios from 'axios';
import { readFileSync } from 'fs';

const parser = new DatauriParser();

export async function dataUri(src) {
    let data;
    const format = src.split('.').at(-1);
    if (src.match(/^data:image/)) {
        return src;
    } else if (src.match(/^https?:/)) {
        data = (
            await axios.get(src, {
                responseType: 'arraybuffer'
            })
        ).data;
    } else {
        data = readFileSync(src);
    }
    return (
        parser
            .format(`.${format}`, data)
            .content// Stupid bug in mimer
            .replace(
                'data:image/png',
                `data:image/${format == 'svg' ? 'svg+xml' : format}`
            )
    );
}
