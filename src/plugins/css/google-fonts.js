export default () => async (rule, declaration, options) => {
    if (declaration.property == 'font-family') {
        if (!options.fonts) {
            options.fonts = [];
        }
        options.fonts.push(
            declaration.value
                // Only the first font-family is actually processed
                // since all others should be fallbacks
                .split(',')[0]
                .replace(/^'/g, '')
                .replace(/'$/g, '')
                .replace("''", "'")
        );
    }
};
