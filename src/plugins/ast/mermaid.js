import { mermaid2svg } from '../../util/mermaid.js';
import { htmlAst } from '../../util/html-ast.js';

export default () => {
    const extractMermaid = (node) => {
        if (node.tagName != 'pre' || node.children.length != 1) {
            return null;
        }
        const code = node.children[0];
        if (
            code.tagName != 'code' ||
            code.children.length != 1 ||
            code.children[0].type != 'text'
        ) {
            return null;
        }
        return code.properties?.className?.includes('language-mermaid')
            ? code.children[0].value
            : null;
    };

    return async (node, { data: { templates } }) => {
        const mermaidYaml = extractMermaid(node);
        if (mermaidYaml) {
            const svg = await mermaid2svg(mermaidYaml);
            const ast = await htmlAst(templates.mermaid({ svg }), [
                'no-missing-references'
            ]);
            return ast.children[0];
        }
    };
};
