import { createWriteStream } from 'fs';
import latex from 'node-latex';
import streamify from 'streamify-string';

import { Path } from '../models/Types';

export const tex2pdf = (tex: string | Buffer, outFile: Path) => {
    return new Promise<void>((resolve, reject) => {
        const input = streamify(
            Buffer.isBuffer(tex) ? tex.toString('utf-8') : tex
        );
        const output = createWriteStream(outFile);
        const pdf = latex(input);

        pdf.pipe(output);
        pdf.on('error', (err) => {
            reject(err);
        });
        pdf.on('finish', () => resolve());
    });
};
