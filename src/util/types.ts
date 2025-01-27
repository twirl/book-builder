export class EnumerationError extends Error {
    constructor(error: never) {
        super();
    }
}

export const isFieldDefined = <T, P extends keyof T>(
    obj: T,
    path: P
): obj is T & Required<Pick<T, P>> => {
    return obj[path] !== undefined;
};
