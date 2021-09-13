import { parse, stringify } from 'css';

export const cssProcess = async (css, { basePath, plugins = [] }) => {
    const ast = parse(css);
    const pluginInstances = plugins.map((plugin) => plugin());

    for (const rule of ast.stylesheet.rules || []) {
        for (const declaration of rule.declarations || []) {
            for (const plugin of pluginInstances) {
                await plugin(rule, declaration, { basePath });
            }
        }
    }

    return stringify(ast);
};
