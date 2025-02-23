import { Root, ElementContent, RootContent, Element, Text } from 'hast';
import { CssNode } from 'css-tree';
import { RuleConfig } from 'html-validate';
import { LanguageFn } from 'highlight.js';

interface Logger {
    debug: (...args: any[]) => void;
    error: (...args: any[]) => void;
}
declare enum LogLevel {
    DEBUG = 10,
    ERROR = 20
}

type OpaqueString<T extends string> = string & {
    __isOpaqueString: T;
};
type HtmlString = OpaqueString<'html'>;
type Href = OpaqueString<'href'>;
type Path = OpaqueString<'path'>;
type CacheKey = OpaqueString<'cache_key'>;

declare class Cache {
    private readonly logger;
    private readonly dir;
    private disabled;
    private purgeMode;
    constructor(logger: Logger, dir: Path, disabled?: boolean, purgeMode?: boolean);
    isEnabled(): boolean;
    isPurgeMode(): boolean;
    static init(logger: Logger, dir: Path, disabled?: boolean, purgeMode?: boolean): Promise<Cache>;
    getCachedOrPutToCache(key: CacheKey, dateMs: number, fallback: () => Promise<Buffer>, ext?: string): Promise<Buffer>;
    getCachedJsonOrPutToCache<T>(key: CacheKey, dateMs: number, fallback: () => Promise<T>): Promise<T>;
    getCached(key: CacheKey, dateMs: number, ext?: string): Promise<Buffer | null>;
    private tryGetJson;
    putToCache(key: CacheKey, data: any, ext?: string): Promise<Path | null>;
    keyToCachedFile(key: CacheKey, ext?: string): Path;
    private static keyToFileName;
    private static toBuffer;
}

interface Options {
    tmpDir: Path;
    noCache: boolean;
    purgeCache: boolean;
    logLevel: LogLevel;
    chapterRange?: [number, number];
    sample: boolean;
}

interface Source {
    dir: Path;
    base: Path;
}

interface Context {
    source: Source;
    options: Options;
    logger: Logger;
    cache: Cache;
}

declare class Counters {
    private sections;
    private chapters;
    constructor();
    getChapterCountIncremented(): number;
    getChapterCount(): number;
    getSectionCountIncremented(): number;
}

interface Chapter {
    title: string;
    anchor: string;
    counter: number;
    content: Root;
    modificationTimeMs: number;
}

declare class Section {
    readonly anchor: string;
    readonly title?: string | undefined;
    private counter?;
    private content?;
    private skipTableOfContents;
    private contentModificationTimeMs;
    private chapters;
    constructor(anchor: string, title?: string | undefined, counter?: number | undefined, content?: Root | undefined, skipTableOfContents?: boolean, contentModificationTimeMs?: number | null);
    getContent(): Root | undefined;
    setContent(content: Root, contentModificationTimeMs?: number): void;
    appendChapter(chapter: Chapter): void;
    getChapters(): Chapter[];
    removeAllChapters(): void;
    inTableOfContents(): boolean;
    getCounter(): number | undefined;
    setCounter(counter?: number): void;
    getContentModificationTimeMs(): number | null;
}

declare class Structure {
    private readonly counters;
    private sections;
    constructor(counters: Counters);
    appendSection(section: Section): void;
    prependSection(section: Section, position: number): void;
    getSections(): Section[];
    getContentModificationTimeMs(): number | null;
}

interface CssClasses {
    anchorLink: string;
    imprintPage: string;
    imgWrapper: string;
    inPlaceReference: string;
    pageBreak: string;
    tableOfContents: string;
    references: string;
    referenceInlineLink: string;
    backAnchor: string;
    externalLink: string;
    refToBibliography: string;
    bibliography: string;
}

interface Strings {
    author: string;
    title: string;
    year: string;
    description: string;
    favicon: string;
    landingUrl: string;
    chapterTitle: string;
    toc: string;
    references: string;
    ibid: string;
    bibliography: string;
    referenceSee: string;
    referenceOr: string;
    coverImageUrl?: string;
}

type BibliographyItemAlias = OpaqueString<'bibliographyItemAlias'>;
interface Reference {
    bibliographyItemAlias?: BibliographyItemAlias;
    text?: string;
    href?: Href;
    alt?: {
        bibliographyItemAlias?: BibliographyItemAlias;
        text?: string;
    };
    counter: number;
}
interface BibliographyItem {
    authors: string;
    publicationDate?: string;
    title: string;
    subtitle?: string[];
    hrefs?: Href[];
}
interface Bibliography {
    [alias: string]: BibliographyItem;
}

declare class DefaultTemplates<S extends Strings = Strings, C extends CssClasses = CssClasses> {
    protected readonly context: Context;
    protected readonly language: string;
    protected readonly locale: string;
    protected readonly strings: S;
    protected readonly cssClasses: Partial<C>;
    constructor(context: Context, language: string, locale: string, strings: S, cssClasses?: Partial<C>);
    protected string(c: keyof S): HtmlString;
    protected href(href: string): HtmlString;
    protected cssClass(c: keyof C): HtmlString;
    jointTitle(titles: string[]): string;
    sectionTitle(section: Section): string;
    chapterTitle(chapter: Chapter): string;
    imageTitle({ title }: AImgParams): string;
    referenceAnchor(ref: Reference, chapter: Chapter, _section: Section): string;
    referenceBackAnchor(ref: Reference, chapter: Chapter, _section: Section): string;
    linkText(href: Href): string;
    bibliographyItemAnchor(alias: BibliographyItemAlias, _item: BibliographyItem): string;
    bibliographyItemShortName(bibliographyItem: BibliographyItem): string;
    epubSectionFilename(section: Section): string;
    epubChapterFilename(chapter: Chapter): string;
    htmlDocument(structure: Structure, css: string): Promise<HtmlString>;
    htmlHead(css: string): Promise<HtmlString>;
    htmlBody(body: string, _structure: Structure): Promise<HtmlString>;
    htmlStructure(structure: Structure): Promise<HtmlString>;
    htmlTableOfContents(structure: Structure): Promise<HtmlString>;
    htmlSection(section: Section): Promise<HtmlString>;
    htmlSectionTitle(section: Section): Promise<HtmlString>;
    htmlSectionContent(content: Root): Promise<HtmlString>;
    htmlChapter(chapter: Chapter): Promise<HtmlString>;
    htmlChapterTitle(chapter: Chapter): Promise<HtmlString>;
    htmlChapterContent(content: Root): Promise<HtmlString>;
    htmlAnchor(text: string, anchor: string): Promise<HtmlString>;
    htmlAImg(params: AImgParams): Promise<HtmlString>;
    htmlAImgTitle(params: AImgParams): Promise<HtmlString>;
    htmlAImgImage(params: AImgParams): Promise<HtmlString>;
    htmlH5Counter(counter: number, iteration: number, content: string, chapter: Chapter, _section: Section): Promise<HtmlString>;
    htmlInPlaceReference(ref: Reference, chapter: Chapter, section: Section, isSuccessiveRefs?: boolean): Promise<HtmlString>;
    htmlExternalLink(href: Href, text: HtmlString, cssClass?: keyof C): Promise<HtmlString>;
    htmlChapterReferences(refs: Reference[], chapter: Chapter, section: Section, bibliography?: Bibliography, prependPath?: string): Promise<HtmlString>;
    htmlReference(ref: Reference, prevRef: Reference | null, chapter: Chapter, section: Section, bibliography?: Bibliography, prependPath?: string): Promise<HtmlString>;
    htmlReferenceLink(ref: Reference, cssClass?: keyof C): Promise<HtmlString | null>;
    htmlReferenceText(ref: Reference, prevRef: Reference | null, bibliography?: Bibliography): Promise<HtmlString>;
    htmlAltReference(ref: Reference & Required<Pick<Reference, 'alt'>>, prevRef: Reference | null, bibliography?: Bibliography): Promise<HtmlString>;
    htmlReferenceBibliographyItem(ref: Reference, prevRef: Reference | null, alias: BibliographyItemAlias, item: BibliographyItem): Promise<HtmlString>;
    htmlAltReferenceBibliographyItem(ref: Reference & Required<Pick<Reference, 'alt'>>, _prevRef: Reference | null, alias: BibliographyItemAlias, item: BibliographyItem): Promise<HtmlString>;
    htmlPageBreak(): Promise<HtmlString>;
    htmlCode(html: string, language: string): Promise<HtmlString>;
    htmlBibliography(bibliography: Bibliography): Promise<string>;
    htmlBibliographyItem(alias: BibliographyItemAlias, item: BibliographyItem): Promise<HtmlString>;
    htmlBibliographyHrefs(hrefs: Href[]): Promise<HtmlString>;
    htmlBibliographyItemFullName(item: BibliographyItem): Promise<HtmlString>;
    htmlBibliographyItemTitle(item: BibliographyItem): Promise<HtmlString>;
    htmlEpubSectionContent(section: Section): Promise<HtmlString>;
    htmlEpubChapterContent(chapter: Chapter, _section: Section): Promise<HtmlString>;
    htmlEpubDocument(root?: Root): Promise<HtmlString>;
    htmlPdfDocument(structure: Structure, css: string): Promise<HtmlString>;
    htmlPdfHeaderTemplate(): Promise<HtmlString>;
    htmlPdfFooterTemplate(): Promise<HtmlString>;
}
interface AImgParams {
    src: string;
    href: Href;
    title: string;
    alt: string;
    size?: string;
}

type Templates<S = Strings, C = CssClasses> = S extends Strings ? C extends CssClasses ? DefaultTemplates<S, C> : never : never;

type L10n<T, S = Strings, C = CssClasses> = T extends Templates<S, C> ? {
    language: string;
    locale: string;
    templates: T;
    strings: S;
} : never;

interface AstPlugin<State, C = ElementContent> {
    init: (state: State) => Promise<AstPluginRunner<State, C>>;
}
interface AstPluginRunner<State, C = ElementContent> {
    run: (input: C, context: AstContext<C>) => Promise<Action<C>>;
    finish: (state: State) => Promise<void>;
}
interface AstContext<C = ElementContent> {
    index: number;
    previousSibling: C | null;
    nextSibling: C | null;
    parent: {
        children: C[];
    };
}
type Action<C = ElementContent> = ContinueAction | ContinueNestedAction | ReplaceAction<C>;
interface ContinueAction {
    action: 'continue';
}
interface ContinueNestedAction {
    action: 'continue_nested';
}
interface ReplaceAction<C = ElementContent> {
    action: 'replace';
    newValue: C | C[];
}

interface CssPluginState<T, S> {
    context: Context;
    l10n: L10n<T, S>;
}
type CssAstPlugin<T, S> = AstPlugin<CssPluginState<T, S>, CssNode>;

type EpubPlugin = <T, S>(html: string, state: BuilderState<T, S>) => Promise<HtmlString>;

type HtmlPlugin = <T, S>(html: string, state: BuilderState<T, S>) => Promise<HtmlString>;

type PdfPlugin = <T, S>(state: PdfPluginState<T, S>) => Promise<Path>;
interface PdfPluginState<T, S> extends BuilderState<T, S> {
    sourceFile: Path;
    structure: Structure;
}

type StructurePlugin<T, S> = (structure: Structure, state: StructurePluginState<T, S>) => Promise<void>;
interface StructurePluginState<T, S> {
    l10n: L10n<T, S>;
    context: Context;
}

type Pipeline<T, S, B extends keyof BuilderMap<T, S>> = CommonPipeline<T, S> & PipelineMap<T, S>[B];
interface CommonPipeline<T, S> {
    structure: {
        plugins: Array<StructurePlugin<T, S>>;
    };
}
interface PipelineMap<T, S> {
    html: {
        html: {
            plugins: Array<HtmlPlugin>;
        };
        css: {
            plugins: Array<CssAstPlugin<T, S>>;
        };
    };
    epub: {
        epub: {
            plugins: Array<EpubPlugin>;
        };
        css: {
            plugins: Array<CssAstPlugin<T, S>>;
        };
    };
    pdf: {
        pdf: {
            plugins: Array<PdfPlugin>;
        };
        css: {
            plugins: Array<CssAstPlugin<T, S>>;
        };
    };
}

type Builder<T, S, O, B extends keyof BuilderMap<T, S>> = (structure: Structure, state: BuilderState<T, S>, pipeline: Pipeline<T, S, B>, options: O) => Promise<void>;
interface BuilderState<T, S> {
    context: Context;
    l10n: L10n<T, S>;
}

type HtmlBuilder<T, S> = Builder<T, S, HtmlBuilderOptions, 'html'>;
interface HtmlBuilderOptions {
    css: string;
    outFile: Path;
}

type EpubBuilder<T, S> = Builder<T, S, EpubBuilderOptions, 'epub'>;
type EpubBuilderOptions = HtmlBuilderOptions;

type PdfBuilder<T, S> = Builder<T, S, PdfBuilderOptions, 'pdf'>;
interface PdfBuilderOptions {
    css: string;
    outFile: Path;
    useCachedContent?: boolean;
}

interface BuilderMap<T, S> {
    html: HtmlBuilder<T, S>;
    epub: EpubBuilder<T, S>;
    pdf: PdfBuilder<T, S>;
}
interface BuilderOptionsMap {
    html: HtmlBuilderOptions;
    epub: EpubBuilderOptions;
    pdf: PdfBuilderOptions;
}
interface BuilderPluginMap {
    html: HtmlPlugin;
    epub: EpubPlugin;
    pdf: PdfPlugin;
}
type RegisteredBuilder<T, S> = BuilderMap<T, S>[keyof BuilderMap<T, S>];
type RegisteredBuilderOptions = BuilderOptionsMap[keyof BuilderOptionsMap];
type RegisteredBuilderPlugin = BuilderPluginMap[keyof BuilderPluginMap];

type StructureAstPlugin<T, S> = AstPlugin<StructureAstState<T, S>, ElementContent>;
type StructureAstPluginRunner<T, S> = AstPluginRunner<StructureAstState<T, S>, ElementContent>;
interface StructureAstState<T, S> {
    context: Context;
    l10n: L10n<T, S>;
    chapter: Chapter;
    section: Section;
}

declare class BookBuilder {
    readonly structure: Structure;
    readonly context: Context;
    constructor(structure: Structure, context: Context);
    build<T extends Templates<S & Strings>, S extends Strings, B extends keyof BuilderMap<T, S>>(target: B, l10n: L10n<T, S>, pipeline: Pipeline<T, S, B>, options: BuilderOptionsMap[B]): Promise<void>;
    toDataUri(path: string): Promise<string>;
}
declare function init(parameters: Parameters): Promise<BookBuilder>;
interface Parameters {
    source: Source;
    options: Partial<Options>;
    logger?: Logger;
}
declare const DEFAULT_OPTIONS: Options;

declare const applyAstPluginToStructure: <T, S>(context: Context, l10n: L10n<T, S>, structure: Structure, plugin: StructureAstPlugin<T, S>, { onSectionBegin, onSectionEnd, onChapterEnd, onEnd }?: Partial<StructureHooks<T, S>>) => Promise<void>;
interface StructureHooks<T, S> {
    onSectionBegin: (section: Section) => Promise<void>;
    onSectionEnd: (section: Section) => Promise<void>;
    onChapterEnd: (runner: StructureAstPluginRunner<T, S>, state: StructureAstState<T, S>, chapter: Chapter, section: Section) => Promise<void>;
    onEnd: () => Promise<void>;
}

declare const applyHastPluginToAst: <T>(ast: Root, plugin: AstPlugin<T, ElementContent>, state: T) => Promise<AstPluginRunner<T, ElementContent>>;
declare const isElement: (node: RootContent) => node is Element;
declare const isTextNode: (node: RootContent) => node is Text;
declare const isElementContent: (node: RootContent) => node is ElementContent;

declare function createStatelessPlugin<T, C>(runner: (input: C, context: AstContext<C>, state: T, options: undefined) => Promise<Action<C>>): AstPlugin<T, C>;
declare function createStatelessPlugin<T, O, C>(runner: (input: C, context: AstContext<C>, state: T, options: O) => Promise<Action<C>>, options: O): AstPlugin<T, C>;

declare const htmlToAst: (html: string) => Promise<Root>;
declare const htmlToAstElements: (html: string) => Promise<Element[]>;

declare const dataUri: <T, S>(options?: Partial<DataUriPluginOptions>) => AstPlugin<CssPluginState<T, S>, CssNode>;
interface DataUriPluginOptions {
    properties: Set<string>;
}

declare const css_dataUri: typeof dataUri;
declare namespace css {
  export { css_dataUri as dataUri };
}

declare const validator: (rules?: RuleConfig) => HtmlPlugin;

declare const html_validator: typeof validator;
declare namespace html {
  export { html_validator as validator };
}

declare const aImg$1: () => <T, S>(structure: Structure, state: StructurePluginState<T, S>) => Promise<void>;

declare const epubLink$1: () => <T, S>(structure: Structure, state: StructurePluginState<T, S>) => Promise<void>;

declare const imgDataUri$1: () => <T, S>(structure: Structure, state: StructurePluginState<T, S>) => Promise<void>;

declare const imgSrcToFileUrl$1: (base: string) => <T, S>(structure: Structure, state: StructurePluginState<T, S>) => Promise<void>;

declare const imprintPages: (html: string, anchor: string) => <T, S>(structure: Structure, _state: StructurePluginState<T, S>) => Promise<void>;

declare const h3Title$1: () => <T, S>(structure: Structure, state: StructurePluginState<T, S>) => Promise<void>;

declare const h5Counter$1: () => <T, S>(structure: Structure, state: StructurePluginState<T, S>) => Promise<void>;

declare const highlighter$1: <T, S>(options?: HighlighterOptions) => AstPlugin<StructureAstState<T, S>, ElementContent>;
interface HighlighterOptions {
    languages?: Array<string | {
        name: string;
        definition: LanguageFn;
    }>;
}

declare const highlighter: (options?: HighlighterOptions) => <T, S>(structure: Structure, state: StructurePluginState<T, S>) => Promise<void>;

declare const hoistSingleChapters: <T, S>() => StructurePlugin<T, S>;

declare const reference: ({ refPrefix, bibliography, anchor, prependPath }?: Partial<ReferencePluginOptions>) => <T, S extends Strings = Strings>(structure: Structure, state: StructurePluginState<T, S>) => Promise<void>;
interface ReferencePluginOptions {
    refPrefix: string;
    bibliography?: Bibliography;
    anchor?: string;
    prependPath?: string;
}

declare const tableOfContents: (options?: Partial<TocOptions>) => <T, S>(structure: Structure, state: StructurePluginState<T, S>) => Promise<void>;
interface TocOptions {
    anchor?: string;
}

declare const structure_highlighter: typeof highlighter;
declare const structure_hoistSingleChapters: typeof hoistSingleChapters;
declare const structure_imprintPages: typeof imprintPages;
declare const structure_reference: typeof reference;
declare const structure_tableOfContents: typeof tableOfContents;
declare namespace structure {
  export { aImg$1 as aImg, epubLink$1 as epubLink, h3Title$1 as h3Title, h5Counter$1 as h5Counter, structure_highlighter as highlighter, structure_hoistSingleChapters as hoistSingleChapters, imgDataUri$1 as imgDataUri, imgSrcToFileUrl$1 as imgSrcToFileUrl, structure_imprintPages as imprintPages, structure_reference as reference, structure_tableOfContents as tableOfContents };
}

declare const aImg: <T, S>() => AstPlugin<StructureAstState<T, S>, ElementContent>;

declare const epubLink: <T, S>(epubChapterIndex: Map<string, string>) => AstPlugin<StructureAstState<T, S>, ElementContent>;

declare const imgDataUri: <T, S>() => AstPlugin<StructureAstState<T, S>, ElementContent>;

declare const imgSrcToFileUrl: <T, S>(base: string) => AstPlugin<StructureAstState<T, S>, ElementContent>;

declare const h3Title: <T, S>() => StructureAstPlugin<T, S>;

declare const h5Counter: <T, S>() => StructureAstPlugin<T, S>;

declare const ref: <T, S>(options: RefAstPluginOptions) => StructureAstPlugin<T, S>;
interface RefAstPluginOptions {
    prefix: string;
    continueCountFrom?: number;
}

declare const structureAst_aImg: typeof aImg;
declare const structureAst_epubLink: typeof epubLink;
declare const structureAst_h3Title: typeof h3Title;
declare const structureAst_h5Counter: typeof h5Counter;
declare const structureAst_imgDataUri: typeof imgDataUri;
declare const structureAst_imgSrcToFileUrl: typeof imgSrcToFileUrl;
declare const structureAst_ref: typeof ref;
declare namespace structureAst {
  export { structureAst_aImg as aImg, structureAst_epubLink as epubLink, structureAst_h3Title as h3Title, structureAst_h5Counter as h5Counter, highlighter$1 as highlighter, structureAst_imgDataUri as imgDataUri, structureAst_imgSrcToFileUrl as imgSrcToFileUrl, structureAst_ref as ref };
}

declare const plugins: {
    css: typeof css;
    html: typeof html;
    pdf: {};
    structure: typeof structure;
    structureAst: typeof structureAst;
};

declare const markdownToAst: (md: string) => Promise<Root>;

declare const escapeHtml: (s: string) => HtmlString;

export { type AImgParams, type Action, type AstContext, type AstPlugin, type AstPluginRunner, type Bibliography, type BibliographyItem, type BibliographyItemAlias, type Builder, type BuilderMap, type BuilderOptionsMap, type BuilderPluginMap, type BuilderState, type CacheKey, type Chapter, type CommonPipeline, type ContinueAction, type ContinueNestedAction, type CssAstPlugin, type CssClasses, type CssPluginState, DEFAULT_OPTIONS, DefaultTemplates, type EpubPlugin, type Href, type HtmlPlugin, type HtmlString, type L10n, LogLevel, type Logger, type Options, type Parameters, type Path, type PdfPlugin, type PdfPluginState, type Pipeline, type PipelineMap, type Reference, type RegisteredBuilder, type RegisteredBuilderOptions, type RegisteredBuilderPlugin, type ReplaceAction, Section, type Source, type Strings, Structure, type StructureAstPlugin, type StructureAstPluginRunner, type StructureAstState, type StructurePlugin, type StructurePluginState, type Templates, applyAstPluginToStructure, applyHastPluginToAst, createStatelessPlugin, escapeHtml, htmlToAst, htmlToAstElements, init, isElement, isElementContent, isTextNode, markdownToAst, plugins };
