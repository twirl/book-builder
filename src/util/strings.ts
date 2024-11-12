export const kebabCase = (s: string) =>
    s.replace(/\p{Lu}/gu, ([letter]) => '-' + letter.toLocaleLowerCase());
