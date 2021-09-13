import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import stringify from 'rehype-stringify';

export const htmlPostProcess = async (value, data) => {
    const pipeline = unified().use(rehypeParse);

    for (const plugin of data.plugins || []) {
        pipeline.use(plugin);
    }

    return (await pipeline.use(stringify).process({ value, data })).value;
};
