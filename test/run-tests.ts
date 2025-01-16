import { spawn } from 'node:child_process';

import { globby } from 'globby';

async function runTests() {
    const tests = await globby(process.argv[2] ?? 'test/**/*.test.ts');

    await new Promise((resolve, reject) => {
        const child = spawn('tsx', ['--test', ...tests], {
            shell: true,
            stdio: 'inherit'
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve(code);
            } else {
                reject(new Error(`Test run finished with code ${code}`));
            }
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}

runTests().then(() => process.exit(0));
