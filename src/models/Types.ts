export type OpaqueString<T extends string> = string & {
    __isOpaqueString: T;
};

export type HtmlString = OpaqueString<'html'>;

export type Href = OpaqueString<'href'>;
