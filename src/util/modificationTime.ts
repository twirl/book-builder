export const getContentModificationTime = <T>(
    arr: T[],
    extractor: (el: T) => number | null,
    startValue: number | null = null
): number | null => {
    return arr.reduce((mTime: number | null, el) => {
        const elMTime = extractor(el);
        return elMTime === null
            ? mTime
            : mTime === null
              ? elMTime
              : Math.max(mTime, elMTime);
    }, startValue);
};
