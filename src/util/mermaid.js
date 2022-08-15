import { tmpdir as osTmpdir } from 'os';
import { randomBytes } from 'crypto';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { exec } from 'child_process';
import { resolve } from 'path';

export async function mermaid2svg(mermaidYaml) {
    const tmpDir = osTmpdir();
    const tmpName = randomBytes(16).toString('hex');
    const tmpInFile = resolve(tmpDir, tmpName + '.yaml');
    const tmpOutFile = resolve(tmpDir, tmpName + '.svg');
    const clear = () => {
        unlinkSync(tmpInFile);
        if (existsSync(tmpOutFile)) {
            unlinkSync(tmpOutFile);
        }
    };

    writeFileSync(tmpInFile, mermaidYaml);
    try {
        const svg = await new Promise((resolve) => {
            exec(
                `"./node_modules/.bin/mmdc" -i ${tmpInFile} -o ${tmpOutFile}`,
                (err) => {
                    if (err) {
                        throw err;
                    }
                    const svg = readFileSync(tmpOutFile, 'utf-8');
                    clear();
                    resolve(svg);
                }
            );
        });
        return svg;
    } catch (e) {
        clear();
        throw e;
    }
}
