import escapeHtml from 'escape-html';

export default () => async (node) => {
    if (node.type == 'text') {
        node.value = escapeHtml(node.value);
    }
};
