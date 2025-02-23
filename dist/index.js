"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve8, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve8(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// index.ts
var index_exports = {};
__export(index_exports, {
  DEFAULT_OPTIONS: () => DEFAULT_OPTIONS,
  DefaultTemplates: () => DefaultTemplates,
  LogLevel: () => LogLevel,
  Section: () => Section,
  Structure: () => Structure,
  applyAstPluginToStructure: () => applyAstPluginToStructure,
  applyHastPluginToAst: () => applyHastPluginToAst,
  createStatelessPlugin: () => createStatelessPlugin,
  escapeHtml: () => escapeHtml,
  htmlToAst: () => htmlToAst,
  htmlToAstElements: () => htmlToAstElements,
  init: () => init,
  isElement: () => isElement,
  isElementContent: () => isElementContent,
  isTextNode: () => isTextNode,
  markdownToAst: () => markdownToAst,
  plugins: () => plugins
});
module.exports = __toCommonJS(index_exports);

// src/BookBuilder.ts
var import_node_path6 = require("path");
var import_datauri = __toESM(require("datauri"));

// src/builders/epub/EpubBuilder.ts
var import_promises = require("fs/promises");
var import_epub_gen_memory = __toESM(require("epub-gen-memory"));

// src/models/Logger.ts
var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2[LogLevel2["DEBUG"] = 10] = "DEBUG";
  LogLevel2[LogLevel2["ERROR"] = 20] = "ERROR";
  return LogLevel2;
})(LogLevel || {});

// src/pipeline/cssAst.ts
var import_css_tree2 = require("css-tree");

// src/util/applyCssAstPlugin.ts
var import_css_tree = require("css-tree");
var applyCssPluginToAst = (ast, plugin, state) => __async(void 0, null, function* () {
  const runner = yield plugin.init(state);
  const updatedChildren = [];
  const children = ast.children.toArray();
  for (const [index, node] of children.entries()) {
    updatedChildren.push(
      ...yield applyPluginToNode(
        node,
        createContext(ast, children, node, index),
        runner
      )
    );
  }
  ast.children = new import_css_tree.List().fromArray(updatedChildren);
  yield runner.finish(state);
});
var applyPluginToNode = (node, context, plugin) => __async(void 0, null, function* () {
  const result = yield plugin.run(node, context);
  switch (result.action) {
    case "replace":
      return Array.isArray(result.newValue) ? result.newValue : [result.newValue];
    case "continue_nested":
      return [node];
    case "continue":
    default:
      return [node];
  }
});
var createContext = (parent, children, node, index) => ({
  index,
  parent: { children },
  previousSibling: index > 0 ? children[index - 1] : null,
  nextSibling: index < children.length - 1 ? children[index + 1] : null
});

// src/pipeline/cssAst.ts
var cssAstPipeline = (css, context, l10n, plugins2) => __async(void 0, null, function* () {
  const ast = (0, import_css_tree2.parse)(css);
  const state = { context, l10n };
  if (ast.type === "StyleSheet") {
    for (const plugin of plugins2) {
      yield applyCssPluginToAst(ast, plugin, state);
    }
  } else {
    context.logger.debug("CSS is not parsed into a stylesheet", css);
  }
  return (0, import_css_tree2.generate)(ast);
});

// src/util/resolveFileSrc.ts
var import_node_path = require("path");
var resolveFileSrc = (src, base) => {
  if (src.startsWith("/") && !src.startsWith("//")) {
    return `file://${(0, import_node_path.resolve)(base, src.slice(1))}`;
  }
  return src;
};

// src/builders/epub/EpubBuilder.ts
var epubBuilder = (structure, state, pipeline, options) => __async(void 0, null, function* () {
  const css = yield cssAstPipeline(
    options.css,
    state.context,
    state.l10n,
    pipeline.css.plugins
  );
  const epubChapters = [];
  for (const section of structure.getSections()) {
    epubChapters.push({
      title: state.l10n.templates.sectionTitle(section),
      content: yield state.l10n.templates.htmlEpubSectionContent(section),
      excludeFromToc: !section.inTableOfContents(),
      beforeToc: !section.inTableOfContents(),
      filename: state.l10n.templates.epubSectionFilename(section)
    });
    for (const chapter of section.getChapters()) {
      const html = yield state.l10n.templates.htmlEpubChapterContent(
        chapter,
        section
      );
      epubChapters.push({
        title: state.l10n.templates.chapterTitle(chapter),
        content: html,
        filename: state.l10n.templates.epubChapterFilename(chapter)
      });
    }
  }
  const { title, author, description, toc } = state.l10n.strings;
  const content = yield (0, import_epub_gen_memory.default)(
    {
      title,
      author,
      description,
      tocTitle: toc,
      lang: state.l10n.language,
      css,
      cover: state.l10n.strings.coverImageUrl ? resolveFileSrc(
        state.l10n.strings.coverImageUrl,
        state.context.source.base
      ) : void 0,
      verbose: state.context.options.logLevel <= 10 /* DEBUG */
    },
    epubChapters
  );
  yield (0, import_promises.writeFile)(options.outFile, content);
});

// src/builders/html/HtmlBuilder.ts
var import_promises2 = require("fs/promises");
var htmlBuilder = (structure, state, pipeline, options) => __async(void 0, null, function* () {
  const css = yield cssAstPipeline(
    options.css,
    state.context,
    state.l10n,
    pipeline.css.plugins
  );
  let html = yield state.l10n.templates.htmlDocument(structure, css);
  for (const plugin of pipeline.html.plugins) {
    html = yield plugin(html, state);
  }
  yield (0, import_promises2.writeFile)(options.outFile, html);
});

// src/builders/pdf/PdfBuilder.ts
var import_node_path2 = require("path");
var import_puppeteer = __toESM(require("puppeteer"));
var pdfBuilder = (structure, state, pipeline, options) => __async(void 0, null, function* () {
  var _a;
  const contentModificationTimeMs = (_a = structure.getContentModificationTimeMs()) != null ? _a : Date.now();
  if (options.useCachedContent) {
    const cachedHtml = yield state.context.cache.getCached(
      (0, import_node_path2.basename)(options.outFile),
      contentModificationTimeMs,
      "html"
    );
    yield doGeneratePdf(
      structure,
      state,
      pipeline,
      options,
      options.outFile,
      cachedHtml ? cachedHtml.toString("utf-8") : void 0
    );
  } else {
    yield doGeneratePdf(
      structure,
      state,
      pipeline,
      options,
      options.outFile
    );
  }
});
var doGeneratePdf = (structure, state, pipeline, options, outFile, cachedHtml) => __async(void 0, null, function* () {
  const css = yield cssAstPipeline(
    options.css,
    state.context,
    state.l10n,
    pipeline.css.plugins
  );
  const html = cachedHtml != null ? cachedHtml : yield state.l10n.templates.htmlPdfDocument(structure, css);
  if (cachedHtml === void 0 && state.context.options.logLevel <= 10 /* DEBUG */) {
    const file = yield state.context.cache.putToCache(
      (0, import_node_path2.basename)(options.outFile),
      html,
      "html"
    );
    state.context.logger.debug("HTML for PDF generated", file);
  }
  const browser = yield import_puppeteer.default.launch({
    headless: true
  });
  const page = yield browser.newPage();
  yield page.setContent(html, {
    waitUntil: "networkidle0"
  });
  yield page.pdf({
    path: outFile,
    preferCSSPageSize: true,
    printBackground: true,
    timeout: 0
  });
  yield browser.close();
});

// src/Cache.ts
var import_node_fs = require("fs");
var import_promises3 = require("fs/promises");
var import_path = require("path");
var Cache = class _Cache {
  constructor(logger, dir, disabled = false, purgeMode = false) {
    this.logger = logger;
    this.dir = dir;
    this.disabled = disabled;
    this.purgeMode = purgeMode;
    logger.debug("Cache initialized", { disabled, purgeMode });
  }
  isEnabled() {
    return !this.disabled;
  }
  isPurgeMode() {
    return this.purgeMode;
  }
  static init(logger, dir, disabled = false, purgeMode = false) {
    return __async(this, null, function* () {
      if (!disabled) {
        try {
          const stats = yield (0, import_promises3.stat)(dir);
          if (!stats.isDirectory()) {
            logger.error(
              `"${dir}" already exists and is not a directory`
            );
            return new _Cache(logger, dir, true);
          }
        } catch (_e) {
          yield (0, import_promises3.mkdir)(dir);
        }
        try {
          yield (0, import_promises3.access)(dir, import_node_fs.constants.W_OK | import_node_fs.constants.X_OK);
        } catch (_e) {
          logger.error(`${dir} is not writeable, cache is disabled`);
          return new _Cache(logger, dir, true);
        }
      }
      return new _Cache(logger, dir, disabled, purgeMode);
    });
  }
  getCachedOrPutToCache(key, dateMs, fallback, ext) {
    return __async(this, null, function* () {
      const cachedContent = yield this.getCached(key, dateMs, ext);
      if (cachedContent !== null) {
        return cachedContent;
      } else {
        const content = yield fallback();
        yield this.putToCache(key, content, ext);
        return content;
      }
    });
  }
  getCachedJsonOrPutToCache(key, dateMs, fallback) {
    return __async(this, null, function* () {
      const cachedContent = yield this.tryGetJson(key, dateMs);
      if (cachedContent !== null) {
        return cachedContent;
      } else {
        const json = yield fallback();
        yield this.putToCache(
          key,
          Buffer.from(JSON.stringify(json, null, 4))
        );
        return json;
      }
    });
  }
  getCached(key, dateMs, ext) {
    return __async(this, null, function* () {
      if (this.disabled) {
        this.logger.debug("Cache is disabled", { key });
        return null;
      }
      try {
        const fileName = this.keyToCachedFile(key, ext);
        const stats = yield (0, import_promises3.stat)(fileName);
        try {
          if (stats.mtimeMs > dateMs && !this.purgeMode) {
            const content = yield (0, import_promises3.readFile)(fileName);
            return content;
          }
          if (this.purgeMode) {
            yield (0, import_promises3.unlink)(fileName);
          }
        } catch (e) {
          this.logger.error(e);
        }
      } catch (e) {
        this.logger.debug(`File not found in cache`, key);
      }
      return null;
    });
  }
  tryGetJson(key, dateMs) {
    return __async(this, null, function* () {
      const content = yield this.getCached(key, dateMs);
      if (content === null) {
        return null;
      } else {
        try {
          const json = JSON.parse(content.toString("utf-8"));
          return json;
        } catch (e) {
          this.logger.error("Cannot read data from cache", e);
          return null;
        }
      }
    });
  }
  putToCache(key, data, ext) {
    return __async(this, null, function* () {
      if (!this.disabled) {
        try {
          const fileName = this.keyToCachedFile(key, ext);
          yield (0, import_promises3.writeFile)(fileName, _Cache.toBuffer(data));
          return fileName;
        } catch (e) {
          this.logger.error("Cannot write cached data", e);
        }
      } else {
        this.logger.debug("Cache is disabled, no data written", { key });
      }
      return null;
    });
  }
  keyToCachedFile(key, ext) {
    return (0, import_path.resolve)(this.dir, _Cache.keyToFileName(key, ext));
  }
  static keyToFileName(key, ext) {
    return key.replace(/[\W]/g, "_") + (ext ? `.${ext}` : "");
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static toBuffer(data) {
    return Buffer.isBuffer(data) ? data : typeof data === "string" ? Buffer.from(data, "utf-8") : Buffer.from(JSON.stringify(data), "utf-8");
  }
};

// src/pipeline/structure.ts
var structurePipeline = (structure, context, l10n, plugins2) => __async(void 0, null, function* () {
  for (const plugin of plugins2) {
    const state = {
      context,
      l10n
    };
    yield plugin(structure, state);
  }
});

// src/util/modificationTime.ts
var getContentModificationTime = (arr, extractor, startValue = null) => arr.reduce((mTime, el) => {
  const elMTime = extractor(el);
  return elMTime === null ? mTime : mTime === null ? elMTime : Math.max(mTime, elMTime);
}, startValue);

// src/structure/helpers/Counters.ts
var Counters = class {
  constructor() {
    this.sections = 0;
    this.chapters = 0;
  }
  getChapterCountIncremented() {
    return ++this.chapters;
  }
  getChapterCount() {
    return this.chapters;
  }
  getSectionCountIncremented() {
    return ++this.sections;
  }
};

// src/structure/helpers/getSectionParametersFromSource.ts
var import_promises4 = require("fs/promises");
var import_node_path4 = require("path");

// src/util/getEntityName.ts
var import_node_path3 = require("path");
function getEntityName(path) {
  return (0, import_node_path3.basename)(path, ".md").replace(/^\d+-/, "");
}
function getEntityAnchor(path) {
  return (0, import_node_path3.basename)(path, ".md").toLowerCase().replace(/^\d+-/, "").replace(/\W+/g, "-");
}

// src/structure/helpers/getSectionParametersFromSource.ts
var getSectionParametersFromSource = (source, _context) => __async(void 0, null, function* () {
  const sectionDirs = [];
  for (const path of yield (0, import_promises4.readdir)(source.dir)) {
    const fullPath = (0, import_node_path4.resolve)(source.dir, path);
    if ((yield (0, import_promises4.stat)(fullPath)).isDirectory()) {
      sectionDirs.push({
        path,
        fullPath
      });
    }
  }
  return sectionDirs.sort((a, b) => a.path < b.path ? -1 : 1).map(({ path, fullPath }, index) => ({
    path: fullPath,
    title: sectionTitle(path, index),
    anchor: sectionAnchor(path, index)
  }));
});
var sectionTitle = (path, _counter) => getEntityName(path);
var sectionAnchor = (path, _counter) => getEntityAnchor(path);

// src/structure/helpers/getSectionWithChaptersFromParameters.ts
var import_promises6 = require("fs/promises");
var import_node_path5 = require("path");

// src/structure/Section.ts
var Section = class {
  constructor(anchor, title, counter, content, skipTableOfContents = false, contentModificationTimeMs = null) {
    this.anchor = anchor;
    this.title = title;
    this.counter = counter;
    this.content = content;
    this.skipTableOfContents = skipTableOfContents;
    this.contentModificationTimeMs = contentModificationTimeMs;
    this.chapters = [];
  }
  getContent() {
    return this.content;
  }
  setContent(content, contentModificationTimeMs) {
    this.content = content;
    if (contentModificationTimeMs !== void 0) {
      this.contentModificationTimeMs = contentModificationTimeMs;
    }
  }
  appendChapter(chapter) {
    this.chapters.push(chapter);
  }
  getChapters() {
    return this.chapters;
  }
  removeAllChapters() {
    this.chapters = [];
  }
  inTableOfContents() {
    return !this.skipTableOfContents;
  }
  getCounter() {
    return this.counter;
  }
  setCounter(counter) {
    this.counter = counter;
  }
  getContentModificationTimeMs() {
    return getContentModificationTime(
      this.getChapters(),
      (chapter) => chapter.modificationTimeMs,
      this.contentModificationTimeMs
    );
  }
};

// src/preprocessors/markdown.ts
var import_remark_gfm = __toESM(require("remark-gfm"));
var import_remark_parse = __toESM(require("remark-parse"));
var import_remark_rehype = __toESM(require("remark-rehype"));
var import_unified2 = require("unified");

// src/preprocessors/html.ts
var import_rehype_parse = __toESM(require("rehype-parse"));
var import_unified = require("unified");
var htmlToAst = (html) => __async(void 0, null, function* () {
  return (0, import_unified.unified)().use(import_rehype_parse.default, { fragment: true }).parse(html);
});
var htmlToAstElements = (html) => __async(void 0, null, function* () {
  return (yield htmlToAst(html)).children.filter((el) => isElement(el));
});

// src/util/applyHastAstPlugin.ts
var applyHastPluginToAst = (ast, plugin, state) => __async(void 0, null, function* () {
  const runner = yield plugin.init(state);
  const updatedChildren = [];
  for (const [index, node] of ast.children.entries()) {
    if (isElement(node) || isTextNode(node)) {
      updatedChildren.push(
        ...yield applyPluginToNode2(
          node,
          makeAstContext(ast, index),
          runner
        )
      );
    } else {
      updatedChildren.push(node);
    }
  }
  ast.children = updatedChildren;
  yield runner.finish(state);
  return runner;
});
var makeAstContext = (ast, index) => {
  var _a, _b;
  const prev = (_a = ast.children[index - 1]) != null ? _a : null;
  const next = (_b = ast.children[index + 1]) != null ? _b : null;
  return {
    index,
    previousSibling: prev && isElementContent(prev) ? prev : null,
    nextSibling: next && isElementContent(next) ? next : null,
    parent: ast
  };
};
var applyPluginToNode2 = (node, context, plugin) => __async(void 0, null, function* () {
  const result = yield plugin.run(node, context);
  const updatedChildren = [];
  switch (result.action) {
    case "replace":
      return Array.isArray(result.newValue) ? result.newValue : [result.newValue];
    case "continue":
      return [node];
    case "continue_nested":
    default:
      if (!isElement(node)) {
        return [node];
      }
      for (const [index, childNode] of node.children.entries()) {
        if (isElement(childNode) || isTextNode(childNode)) {
          updatedChildren.push(
            ...yield applyPluginToNode2(
              childNode,
              makeAstContext(node, index),
              plugin
            )
          );
        } else {
          updatedChildren.push(childNode);
        }
      }
      node.children = updatedChildren;
      return [node];
  }
});
var isElement = (node) => node.type === "element";
var isTextNode = (node) => node.type === "text";
var isElementContent = (node) => ["element", "text", "comment"].includes(node.type);

// src/preprocessors/markdown.ts
var markdownToAst = (md) => __async(void 0, null, function* () {
  const processor = (0, import_unified2.unified)().use(import_remark_parse.default).use(import_remark_gfm.default).use(import_remark_rehype.default);
  const mdAst = processor.parse(md);
  return processor.run(mdAst);
});

// src/util/readFile.ts
var import_promises5 = require("fs/promises");
var import_unorm = __toESM(require("unorm"));
var readUtf8File = (path) => __async(void 0, null, function* () {
  return import_unorm.default.nfd(yield (0, import_promises5.readFile)(path, "utf-8"));
});

// src/structure/helpers/buildChapterFromSource.ts
var buildChapterFromSource = (path, fileStat, counters, context) => __async(void 0, null, function* () {
  return context.cache.getCachedJsonOrPutToCache(
    path,
    fileStat.mtimeMs,
    () => __async(void 0, null, function* () {
      const md = yield readUtf8File(path);
      const ast = yield markdownToAst(md);
      const counter = counters.getChapterCount();
      return {
        content: ast,
        title: chapterTitle(path),
        anchor: chapterAnchor(path),
        counter,
        modificationTimeMs: fileStat.mtimeMs
      };
    })
  );
});
var chapterTitle = (path, headers) => (headers == null ? void 0 : headers.length) ? headers.join(". ") : getEntityName(path);
var chapterAnchor = (path) => getEntityAnchor(path);

// src/structure/helpers/getSectionWithChaptersFromParameters.ts
var getSectionWithChaptersFromParameters = (parameters, counters, context) => __async(void 0, null, function* () {
  const files = [];
  for (const file of yield (0, import_promises6.readdir)(parameters.path)) {
    const path = (0, import_node_path5.resolve)(parameters.path, file);
    const stat3 = yield (0, import_promises6.stat)(path);
    if (stat3.isFile() && file.endsWith(".md")) {
      files.push({ path, stat: stat3 });
    }
  }
  const section = new Section(parameters.anchor, parameters.title);
  for (const { path, stat: stat3 } of files.sort()) {
    const chapterCounter = counters.getChapterCountIncremented();
    const range = context.options.chapterRange;
    if (range === void 0 || chapterCounter >= range[0] && chapterCounter <= range[1]) {
      section.appendChapter(
        yield buildChapterFromSource(
          path,
          stat3,
          counters,
          context
        )
      );
    }
  }
  return section;
});

// src/structure/Structure.ts
var Structure = class {
  constructor(counters) {
    this.counters = counters;
    this.sections = [];
  }
  appendSection(section) {
    section.setCounter(this.counters.getSectionCountIncremented());
    this.sections.push(section);
  }
  prependSection(section, position) {
    this.sections.splice(position, 0, section);
  }
  getSections() {
    return this.sections;
  }
  getContentModificationTimeMs() {
    return getContentModificationTime(
      this.getSections(),
      (section) => section.getContentModificationTimeMs()
    );
  }
};
var getStructure = (source, context) => __async(void 0, null, function* () {
  const counters = new Counters();
  const structure = new Structure(counters);
  const sectionParameters = yield getSectionParametersFromSource(
    source,
    context
  );
  for (const parameters of sectionParameters) {
    structure.appendSection(
      yield getSectionWithChaptersFromParameters(
        parameters,
        counters,
        context
      )
    );
  }
  return structure;
});

// src/BookBuilder.ts
var BookBuilder = class {
  constructor(structure, context) {
    this.structure = structure;
    this.context = context;
  }
  build(target, l10n, pipeline, options) {
    return __async(this, null, function* () {
      yield structurePipeline(
        this.structure,
        this.context,
        l10n,
        pipeline.structure.plugins
      );
      const state = {
        l10n,
        context: this.context
      };
      switch (target) {
        case "html":
          yield htmlBuilder(
            this.structure,
            state,
            pipeline,
            options
          );
          break;
        case "epub":
          yield epubBuilder(
            this.structure,
            state,
            pipeline,
            options
          );
          break;
        case "pdf":
          yield pdfBuilder(
            this.structure,
            state,
            pipeline,
            options
          );
          break;
        default:
          this.context.logger.error("Unknown target", target);
          throw new Error(`Unknown target: ${target}`);
      }
    });
  }
  toDataUri(path) {
    return __async(this, null, function* () {
      var _a;
      return (_a = yield (0, import_datauri.default)(
        (0, import_node_path6.resolve)(this.context.source.base, ...path.split("/"))
      )) != null ? _a : path;
    });
  }
};
function init(parameters) {
  return __async(this, null, function* () {
    var _a;
    const options = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS), parameters.options || {});
    const logger = (_a = parameters.logger) != null ? _a : new ConsoleLogger(options);
    const cache = yield Cache.init(
      logger,
      (0, import_node_path6.resolve)(options.tmpDir),
      options.noCache,
      options.purgeCache
    );
    const context = {
      logger,
      cache,
      options,
      source: parameters.source
    };
    const structure = yield getStructure(parameters.source, context);
    return new BookBuilder(structure, context);
  });
}
var DEFAULT_OPTIONS = {
  tmpDir: "./tmp",
  noCache: false,
  purgeCache: false,
  logLevel: 10 /* DEBUG */,
  sample: false
};
var ConsoleLogger = class {
  constructor(options) {
    this.options = options;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(...args) {
    if (this.options.logLevel <= 10 /* DEBUG */) {
      console.log(...args);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(...args) {
    console.error(...args);
  }
};

// src/util/applyAstPluginToStructure.ts
var applyAstPluginToStructure = (_0, _1, _2, _3, ..._4) => __async(void 0, [_0, _1, _2, _3, ..._4], function* (context, l10n, structure, plugin, {
  onSectionBegin,
  onSectionEnd,
  onChapterEnd,
  onEnd
} = {}) {
  for (const section of structure.getSections()) {
    if (onSectionBegin) {
      yield onSectionBegin(section);
    }
    for (const chapter of section.getChapters()) {
      const state = {
        context,
        l10n,
        chapter,
        section
      };
      const runner = yield applyHastPluginToAst(
        chapter.content,
        plugin,
        state
      );
      if (onChapterEnd) {
        yield onChapterEnd(runner, state, chapter, section);
      }
    }
    if (onSectionEnd) {
      yield onSectionEnd(section);
    }
  }
  if (onEnd) {
    yield onEnd();
  }
});

// src/util/statelessPlugin.ts
function createStatelessPlugin(runner, options) {
  return {
    init: (state) => __async(this, null, function* () {
      return {
        run: (input, context) => runner(input, context, state, options),
        finish: () => __async(this, null, function* () {
        })
      };
    })
  };
}

// src/plugins/css/index.ts
var css_exports = {};
__export(css_exports, {
  dataUri: () => dataUri
});

// src/plugins/css/dataUri.ts
var import_node_path7 = require("path");
var import_datauri2 = __toESM(require("datauri"));
var dataUri = (options = {}) => {
  const resolvedOptions = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS2), options);
  return createStatelessPlugin(
    (input, _context, state) => __async(void 0, null, function* () {
      if ("block" in input && input.block !== null && "children" in input.block) {
        for (const item of input.block.children.toArray()) {
          if (item.type === "Declaration" && resolvedOptions.properties.has(item.property) && item.value.type === "Value") {
            for (const value of item.value.children.toArray()) {
              if (value.type === "Url") {
                const data = yield (0, import_datauri2.default)(
                  (0, import_node_path7.resolve)(
                    state.context.source.base,
                    ...value.value.split("/")
                  )
                );
                if (data) {
                  value.value = data;
                }
              }
            }
          }
        }
      }
      return { action: "continue_nested" };
    })
  );
};
var DEFAULT_OPTIONS2 = {
  properties: /* @__PURE__ */ new Set(["src", "background-image"])
};

// src/plugins/html/index.ts
var html_exports = {};
__export(html_exports, {
  validator: () => validator
});

// src/plugins/html/validator.ts
var import_html_validate = require("html-validate");
var DEFAULT_OPTIONS3 = {
  extends: ["html-validate:document"],
  rules: {
    "heading-level": "off",
    "require-sri": "off"
  }
};
var validator = (rules = {}) => {
  const callback = (_0, _1) => __async(void 0, [_0, _1], function* (html, { context }) {
    try {
      const validator2 = new import_html_validate.HtmlValidate(__spreadProps(__spreadValues({}, DEFAULT_OPTIONS3), {
        rules: __spreadValues(__spreadValues({}, DEFAULT_OPTIONS3.rules), rules)
      }));
      const result = yield validator2.validateString(html);
      if (result.valid) {
        context.logger.debug(
          `HTML source valid.
Messages: ${getValidatorMessages(result)}`
        );
      } else {
        context.logger.error(
          `HTML source validation error: ${getValidatorMessages(result)}`
        );
      }
    } catch (error) {
      context.logger.error("Cannot validate HTML", error);
    }
    return html;
  });
  return callback;
};
function getValidatorMessages(result) {
  return JSON.stringify(
    result.results.reduce((acc, r) => acc.concat(r.messages), []),
    null,
    4
  );
}

// src/plugins/structure/index.ts
var structure_exports = {};
__export(structure_exports, {
  aImg: () => aImg2,
  epubLink: () => epubLink2,
  h3Title: () => h3Title2,
  h5Counter: () => h5Counter2,
  highlighter: () => highlighter2,
  hoistSingleChapters: () => hoistSingleChapters,
  imgDataUri: () => imgDataUri2,
  imgSrcToFileUrl: () => imgSrcToFileUrl2,
  imprintPages: () => imprintPages,
  reference: () => reference,
  tableOfContents: () => tableOfContents
});

// src/plugins/structureAst/aImg.ts
var aImg = () => createStatelessPlugin(
  (_0, _1, _2) => __async(void 0, [_0, _1, _2], function* (p, _context, { l10n }) {
    var _a, _b, _c, _d, _e, _f;
    if (isElement(p) && p.children.length == 1) {
      const node = p.children[0];
      if (isElement(node) && node.tagName == "a" && node.children.length == 1) {
        const img = node.children[0];
        if (isElement(img) && img.tagName == "img") {
          const size = ((_b = (_a = img.properties.dataOriginalSrc) != null ? _a : img.properties.src) != null ? _b : "").toString().match(/\.(size-\w+)\./);
          const nodes = yield htmlToAstElements(
            yield l10n.templates.htmlAImg({
              href: ((_c = node.properties.href) != null ? _c : "").toString(),
              src: ((_d = img.properties.src) != null ? _d : "").toString(),
              alt: ((_e = img.properties.alt) != null ? _e : "").toString(),
              title: ((_f = img.properties.title) != null ? _f : "").toString(),
              size: size ? size[1] : void 0
            })
          );
          return { action: "replace", newValue: nodes };
        }
      }
    }
    return { action: "continue_nested" };
  })
);

// src/plugins/structure/aImg.ts
var aImg2 = () => (structure, state) => applyAstPluginToStructure(
  state.context,
  state.l10n,
  structure,
  aImg()
);

// src/util/escapeHtml.ts
var import_escape_html = __toESM(require("escape-html"));
var escapeHtml = (s) => (0, import_escape_html.default)(s);

// src/plugins/structureAst/epubLink.ts
var epubLink = (epubChapterIndex) => createStatelessPlugin(
  (node, _context, state) => __async(void 0, null, function* () {
    if (isElement(node) && node.tagName === "a") {
      const { href } = node.properties;
      if (typeof href === "string" && href.startsWith("#")) {
        const path = matchPath(epubChapterIndex, href.slice(1));
        if (path) {
          node.properties.href = `${escapeHtml(path)}${href}`;
          state.context.logger.debug(
            "EPUB link converted",
            href,
            node.properties.href
          );
          return {
            action: "continue"
          };
        } else {
          state.context.logger.error(
            "Cannot process internal reference",
            href
          );
        }
      }
    }
    return {
      action: "continue_nested"
    };
  })
);
var matchPath = (epubChapterIndex, fragment) => {
  const fullMatch = epubChapterIndex.get(fragment);
  if (fullMatch) {
    return fullMatch;
  } else {
    for (const [prefix, path] of epubChapterIndex) {
      if (fragment.startsWith(prefix)) {
        return path;
      }
    }
  }
};

// src/plugins/structure/epubLink.ts
var epubLink2 = () => (structure, state) => {
  const epubLinkMap = /* @__PURE__ */ new Map();
  for (const section of structure.getSections()) {
    epubLinkMap.set(
      section.anchor,
      state.l10n.templates.epubSectionFilename(section)
    );
    for (const chapter of section.getChapters()) {
      epubLinkMap.set(
        chapter.anchor,
        state.l10n.templates.epubChapterFilename(chapter)
      );
    }
  }
  return applyAstPluginToStructure(
    state.context,
    state.l10n,
    structure,
    epubLink(epubLinkMap)
  );
};

// src/plugins/structureAst/imgDataUri.ts
var import_node_path8 = require("path");
var import_datauri3 = __toESM(require("datauri"));
var imgDataUri = () => createStatelessPlugin(
  (node, _context, state) => __async(void 0, null, function* () {
    if (isElement(node) && node.tagName === "img" && typeof node.properties.src === "string") {
      node.properties.dataOriginalSrc = node.properties.src;
      node.properties.src = yield (0, import_datauri3.default)(
        (0, import_node_path8.resolve)(
          state.context.source.base,
          ...node.properties.src.split("/")
        )
      );
      return {
        action: "continue"
      };
    }
    return {
      action: "continue_nested"
    };
  })
);

// src/plugins/structure/imgDataUri.ts
var imgDataUri2 = () => (structure, state) => applyAstPluginToStructure(
  state.context,
  state.l10n,
  structure,
  imgDataUri()
);

// src/plugins/structureAst/imgSrcToFileUrl.ts
var imgSrcToFileUrl = (base) => createStatelessPlugin(
  (node) => __async(void 0, null, function* () {
    if (isElement(node) && node.tagName === "img" && typeof node.properties.src === "string") {
      node.properties.src = resolveFileSrc(node.properties.src, base);
      return { action: "continue" };
    }
    return { action: "continue_nested" };
  })
);

// src/plugins/structure/imgSrcToFileUrl.ts
var imgSrcToFileUrl2 = (base) => (structure, state) => applyAstPluginToStructure(
  state.context,
  state.l10n,
  structure,
  imgSrcToFileUrl(base)
);

// src/plugins/structure/imprintPages.ts
var imprintPages = (html, anchor) => (structure, _state) => __async(void 0, null, function* () {
  structure.prependSection(
    new Section(
      anchor,
      void 0,
      void 0,
      yield htmlToAst(html),
      true
    ),
    0
  );
});

// src/plugins/structureAst/h3Title.ts
var import_striptags = __toESM(require("striptags"));

// src/util/astToHtml.ts
var import_rehype_stringify = __toESM(require("rehype-stringify"));
var import_unified3 = require("unified");
var astToHtml = (ast) => __async(void 0, null, function* () {
  return (0, import_unified3.unified)().use(import_rehype_stringify.default, {
    closeSelfClosing: true
  }).stringify(ast);
});
var astNodeToHtml = (ast) => __async(void 0, null, function* () {
  return (0, import_unified3.unified)().use(import_rehype_stringify.default, {
    closeSelfClosing: true
  }).stringify({
    type: "root",
    children: [ast]
  });
});

// src/plugins/structureAst/h3Title.ts
var h3Title = () => ({
  init: () => __async(void 0, null, function* () {
    return new H3TitlePlugin();
  })
});
var H3TitlePlugin = class {
  constructor() {
    this.h3Contents = [];
  }
  run(node) {
    return __async(this, null, function* () {
      if (node.type === "element" && node.tagName === "h3") {
        this.h3Contents.push((0, import_striptags.default)(yield astNodeToHtml(node)));
        return this.h3Contents.length === 1 ? { action: "replace", newValue: [] } : { action: "continue" };
      }
      return { action: "continue_nested" };
    });
  }
  finish(state) {
    return __async(this, null, function* () {
      if (this.h3Contents.length) {
        state.chapter.title = state.l10n.templates.jointTitle(
          this.h3Contents
        );
      }
    });
  }
};

// src/plugins/structure/h3Title.ts
var h3Title2 = () => (structure, state) => applyAstPluginToStructure(
  state.context,
  state.l10n,
  structure,
  h3Title()
);

// src/plugins/structureAst/h5Counter.ts
var h5Counter = () => ({
  init: (state) => __async(void 0, null, function* () {
    return new H5CounterPlugin(state);
  })
});
var H5CounterPlugin = class {
  constructor(state) {
    this.state = state;
    this.counter = 0;
    this.iteration = 1;
  }
  run(node) {
    return __async(this, null, function* () {
      if (node.type === "element" && node.tagName === "h5") {
        const contentElement = node.children[0];
        if ((contentElement == null ? void 0 : contentElement.type) === "text") {
          let content = contentElement.value.trim();
          const match = content.match(/^(\d+)\.\s*/);
          if (match) {
            this.counter = Number(match[1]);
            content = content.slice(match[0].length);
            this.iteration++;
          } else {
            this.counter++;
          }
          return {
            action: "replace",
            newValue: yield htmlToAstElements(
              yield this.state.l10n.templates.htmlH5Counter(
                this.counter,
                this.iteration,
                content,
                this.state.chapter,
                this.state.section
              )
            )
          };
        }
      }
      return { action: "continue_nested" };
    });
  }
  finish() {
    return __async(this, null, function* () {
    });
  }
};

// src/plugins/structure/h5Counter.ts
var h5Counter2 = () => (structure, state) => applyAstPluginToStructure(
  state.context,
  state.l10n,
  structure,
  h5Counter()
);

// src/plugins/structureAst/highlighter.ts
var import_highlight = __toESM(require("highlight.js"));
var import_typescript = __toESM(require("highlight.js/lib/languages/typescript"));
var highlighter = (options) => {
  var _a;
  const languages = (_a = options == null ? void 0 : options.languages) != null ? _a : [];
  const hljs = import_highlight.default.newInstance();
  for (const language of languages) {
    const name = typeof language === "string" ? language : language.name;
    const definition = typeof language === "string" ? DEFAULT_LANGUAGE_DEFITIONS[language] : language.definition;
    if (definition) {
      hljs.registerLanguage(name.toLocaleLowerCase(), definition);
    }
  }
  return createStatelessPlugin(
    (node, _context, state) => __async(void 0, null, function* () {
      const code = extractCode(node);
      if (code && code.language && languages.includes(code.language)) {
        const highlighted = hljs.highlight(code.code, {
          language: code.language
        });
        const html = highlighted.value.replace(
          /\<span[^\>]*\>\/\*\s*&lt;em&gt;\s*\*\/\<\/span\>/g,
          "<em>"
        ).replace(
          /\<span[^\>]*\>\/\*\s*&lt;\/em&gt;\s*\*\/\<\/span\>/g,
          "</em>"
        );
        return {
          action: "replace",
          newValue: yield htmlToAstElements(
            yield state.l10n.templates.htmlCode(html, code.language)
          )
        };
      }
      return { action: "continue_nested" };
    })
  );
};
var extractCode = (node) => {
  var _a;
  if (node.type === "element") {
    if (node.tagName != "pre" || node.children.length != 1) {
      return null;
    }
    const code = node.children[0];
    if (code.type !== "element" || code.tagName != "code" || code.children.length != 1 || code.children[0].type != "text") {
      return null;
    }
    const language = (_a = getClassNames(code).find((c) => c.startsWith("language-"))) == null ? void 0 : _a.replace("language-", "");
    return language ? {
      code: code.children[0].value,
      language
    } : null;
  }
  return null;
};
var getClassNames = (node) => {
  var _a;
  const className = (_a = node.properties) == null ? void 0 : _a.className;
  if (typeof className === "string") {
    return [className];
  } else if (Array.isArray(className)) {
    return className.map((v) => String(v));
  } else {
    return [];
  }
};
var DEFAULT_LANGUAGE_DEFITIONS = {
  json: (hljs) => {
    const ATTRIBUTE = {
      begin: new RegExp('(?<!":\\s*)"(\\\\.|[^\\\\"\\r\\n])*"'),
      className: "attr"
    };
    const PUNCTUATION = {
      match: /{}[[\],:]/,
      className: "punctuation"
    };
    const LITERALS = ["true", "false", "null"];
    const LITERALS_MODE = {
      scope: "literal",
      beginKeywords: LITERALS.join(" ")
    };
    return {
      name: "json",
      keywords: {
        keyword: "GET POST PUT PATCH DELETE \u2192 \u2026",
        literal: LITERALS
      },
      contains: [
        ATTRIBUTE,
        {
          scope: "string",
          begin: /(?!^:\s*)"/,
          end: '"'
        },
        {
          match: /{[\w\d-_]+}|<[\w\d-_\s\\n]+>/,
          className: "substitution"
        },
        PUNCTUATION,
        LITERALS_MODE,
        hljs.C_NUMBER_MODE,
        hljs.C_LINE_COMMENT_MODE,
        hljs.C_BLOCK_COMMENT_MODE
      ]
    };
  },
  typescript: import_typescript.default
};

// src/plugins/structure/highligher.ts
var highlighter2 = (options) => (structure, state) => applyAstPluginToStructure(
  state.context,
  state.l10n,
  structure,
  highlighter(options)
);

// src/plugins/structure/hoistSingleChapters.ts
var hoistSingleChapters = () => {
  const callback = (structure, _state) => __async(void 0, null, function* () {
    for (const section of structure.getSections()) {
      const chapters = section.getChapters();
      if (chapters.length === 1) {
        section.setContent(
          chapters[0].content,
          chapters[0].modificationTimeMs
        );
        section.removeAllChapters();
      }
    }
  });
  return callback;
};

// src/plugins/structureAst/ref.ts
var ref = (options) => ({
  init: (state) => __async(void 0, null, function* () {
    return new RefAstPluginRunner(state, options);
  })
});
var RefAstPluginRunner = class {
  constructor(state, options) {
    this.state = state;
    this.options = options;
    this.refs = [];
    this.isSuccessiveRefs = false;
    var _a;
    this.matchRe = new RegExp(
      `^${this.options.prefix}(?::(?<alias>[\\w-_]+))?(?:\\s+(?<text>[^\\|]+))?(?:\\|\\s*${this.options.prefix}(?::(?<altAlias>[\\w-_]+))?(?:\\s+(?<altText>.+))?)?$`
    );
    this.counter = (_a = options.continueCountFrom) != null ? _a : 1;
  }
  run(node) {
    return __async(this, null, function* () {
      if (node.type === "element" && node.tagName === "a") {
        const { href } = node.properties;
        const content = node.children[0];
        if ((content == null ? void 0 : content.type) === "text") {
          const ref2 = this.matchReferenceContent(
            this.counter,
            content.value,
            href ? String(href) : void 0
          );
          if (ref2) {
            this.counter++;
            this.refs.push(ref2);
            const newValue = yield htmlToAstElements(
              yield this.state.l10n.templates.htmlInPlaceReference(
                ref2,
                this.state.chapter,
                this.state.section,
                this.isSuccessiveRefs
              )
            );
            this.isSuccessiveRefs = true;
            return {
              action: "replace",
              newValue
            };
          }
        }
      }
      this.isSuccessiveRefs = false;
      return { action: "continue_nested" };
    });
  }
  matchReferenceContent(counter, content, href) {
    const match = content.match(this.matchRe);
    if (match == null ? void 0 : match.groups) {
      const { groups } = match;
      const { alias } = groups;
      const alt = groups.altAlias || groups.altText ? {
        bibliographyItemAlias: groups.altAlias,
        text: groups.altText
      } : void 0;
      const ref2 = {
        bibliographyItemAlias: alias ? alias : void 0,
        text: groups.text,
        href: href ? href : void 0,
        alt,
        counter
      };
      return ref2;
    } else {
      return null;
    }
  }
  finish() {
    return __async(this, null, function* () {
    });
  }
  getRefs() {
    return this.refs;
  }
};

// src/plugins/structure/reference.ts
var reference = ({
  refPrefix = "ref",
  bibliography = {},
  anchor = "bibliography",
  prependPath
} = {}) => (structure, state) => __async(void 0, null, function* () {
  yield applyAstPluginToStructure(
    state.context,
    state.l10n,
    structure,
    ref({ prefix: refPrefix }),
    {
      onChapterEnd: (runner, _state, chapter, section) => __async(void 0, null, function* () {
        const refs = runner.getRefs();
        if (refs.length) {
          chapter.content.children.push(
            ...yield htmlToAstElements(
              yield state.l10n.templates.htmlChapterReferences(
                refs,
                chapter,
                section,
                bibliography,
                prependPath
              )
            )
          );
        }
      })
    }
  );
  structure.appendSection(
    new Section(anchor, state.l10n.strings.bibliography, void 0, {
      type: "root",
      children: yield htmlToAstElements(
        yield state.l10n.templates.htmlBibliography(bibliography)
      )
    })
  );
});

// src/plugins/structure/tableOfContents.ts
var tableOfContents = (options = {}) => (structure, state) => __async(void 0, null, function* () {
  var _a;
  structure.prependSection(
    new Section(
      (_a = options.anchor) != null ? _a : "toc",
      void 0,
      void 0,
      yield htmlToAst(
        yield state.l10n.templates.htmlTableOfContents(structure)
      ),
      true
    ),
    0
  );
});

// src/plugins/structureAst/index.ts
var structureAst_exports = {};
__export(structureAst_exports, {
  aImg: () => aImg,
  epubLink: () => epubLink,
  h3Title: () => h3Title,
  h5Counter: () => h5Counter,
  highlighter: () => highlighter,
  imgDataUri: () => imgDataUri,
  imgSrcToFileUrl: () => imgSrcToFileUrl,
  ref: () => ref
});

// src/plugins/index.ts
var plugins = {
  css: css_exports,
  html: html_exports,
  pdf: {},
  structure: structure_exports,
  structureAst: structureAst_exports
};

// src/util/strings.ts
var kebabCase = (s) => s.replace(new RegExp("\\p{Lu}", "gu"), ([letter]) => `-${letter.toLocaleLowerCase()}`);

// src/util/types.ts
var isFieldDefined = (obj, path) => obj[path] !== void 0;

// src/templates/Templates.ts
var DefaultTemplates = class {
  constructor(context, language, locale, strings, cssClasses = {}) {
    this.context = context;
    this.language = language;
    this.locale = locale;
    this.strings = strings;
    this.cssClasses = cssClasses;
  }
  string(c) {
    return escapeHtml(String(this.strings[c]));
  }
  href(href) {
    return `href="${escapeHtml(href)}"`;
  }
  cssClass(c) {
    return ` class="${escapeHtml(
      typeof this.cssClasses[c] === "string" ? String(this.cssClasses[c]) : kebabCase(String(c))
    )}"`;
  }
  jointTitle(titles) {
    return titles.join(". ");
  }
  sectionTitle(section) {
    var _a;
    return (_a = section.title) != null ? _a : "";
  }
  chapterTitle(chapter) {
    return `${this.strings.chapterTitle}\xA0${chapter.counter}. ${chapter.title}`;
  }
  imageTitle({ title }) {
    return title;
  }
  referenceAnchor(ref2, chapter, _section) {
    return `${chapter.anchor}-ref-${ref2.counter}`;
  }
  referenceBackAnchor(ref2, chapter, _section) {
    return `${chapter.anchor}-ref-${ref2.counter}-back`;
  }
  linkText(href) {
    return href.replace(/^[\w+]+:\/\//, "").replace(/\/$/, "");
  }
  bibliographyItemAnchor(alias, _item) {
    return `bibliography-${getEntityAnchor(alias)}`;
  }
  bibliographyItemShortName(bibliographyItem) {
    return `${bibliographyItem.authors}${bibliographyItem.publicationDate ? `\xA0(${bibliographyItem.publicationDate})` : ""}`;
  }
  epubSectionFilename(section) {
    return `${section.anchor}.xhtml`;
  }
  epubChapterFilename(chapter) {
    return `${chapter.anchor}.xhtml`;
  }
  htmlDocument(structure, css) {
    return __async(this, null, function* () {
      return `<!doctype html><html lang="${this.locale}"><head>${yield this.htmlHead(css)}</head><body>${yield this.htmlBody(
        yield this.htmlStructure(structure),
        structure
      )}</body></html>`;
    });
  }
  htmlHead(css) {
    return __async(this, null, function* () {
      return `<meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${this.string("author")}. ${this.string("title")}</title>
        <meta name="author" content="${this.string("author")}"/>
        <meta name="description" content="${this.string("description")}"/>
        <meta property="og:title" content="${this.string("author")}. ${this.string("title")}"/>
        <meta property="og:url" content="${this.string("landingUrl")}"/>
        <meta property="og:type" content="article"/>
        <meta property="og:description" content="${this.string("description")}"/>
        <meta property="og:locale" content="${escapeHtml(this.locale)}"/>
        <link rel="icon" ${this.href(this.strings.favicon)}/>
        <style>${css}</style>`;
    });
  }
  htmlBody(body, _structure) {
    return __async(this, null, function* () {
      return `<article>${body}</article>`;
    });
  }
  htmlStructure(structure) {
    return __async(this, null, function* () {
      const htmlParts = [];
      for (const section of structure.getSections()) {
        htmlParts.push(yield this.htmlSection(section));
      }
      return htmlParts.join(yield this.htmlPageBreak());
    });
  }
  htmlTableOfContents(structure) {
    return __async(this, null, function* () {
      return `<nav><h2>${this.string(
        "toc"
      )}</h2><ul ${this.cssClass("tableOfContents")}>${structure.getSections().reduce((sectionHtml, section) => {
        if (section.inTableOfContents()) {
          sectionHtml.push(
            `<li><a ${this.href(`#${section.anchor}`)}>${escapeHtml(
              this.sectionTitle(section)
            )}</a>${section.getChapters().length ? `<ul>${section.getChapters().map(
              (chapter) => `<li><a ${this.href(
                `#${chapter.anchor}`
              )}>${escapeHtml(
                this.chapterTitle(chapter)
              )}</a></li>`
            ).join("")}</ul>` : ""}</li>`
          );
        }
        return sectionHtml;
      }, []).join("")}</ul></nav>`;
    });
  }
  htmlSection(section) {
    return __async(this, null, function* () {
      const htmlParts = [];
      const content = section.getContent();
      if (content) {
        htmlParts.push(yield this.htmlSectionContent(content));
      }
      for (const chapter of section.getChapters()) {
        htmlParts.push(yield this.htmlChapter(chapter));
      }
      return `<section>${yield this.htmlSectionTitle(
        section
      )}${htmlParts.join(
        yield this.htmlPageBreak()
      )}</section>`;
    });
  }
  htmlSectionTitle(section) {
    return __async(this, null, function* () {
      return section.title ? `<h2>${section.anchor ? yield this.htmlAnchor(
        this.sectionTitle(section),
        section.anchor
      ) : this.sectionTitle(section)}</h2>` : "";
    });
  }
  htmlSectionContent(content) {
    return __async(this, null, function* () {
      return astToHtml(content);
    });
  }
  htmlChapter(chapter) {
    return __async(this, null, function* () {
      return `${yield this.htmlChapterTitle(chapter)}${yield this.htmlChapterContent(
        chapter.content
      )}`;
    });
  }
  htmlChapterTitle(chapter) {
    return __async(this, null, function* () {
      return `<h3>${yield this.htmlAnchor(
        this.chapterTitle(chapter),
        chapter.anchor
      )}</h3>`;
    });
  }
  htmlChapterContent(content) {
    return __async(this, null, function* () {
      return astToHtml(content);
    });
  }
  htmlAnchor(text, anchor) {
    return __async(this, null, function* () {
      return `<a ${this.cssClass("anchorLink")} id="${escapeHtml(
        anchor
      )}" href="#${escapeHtml(
        anchor
      )}">${escapeHtml(text)}</a>`;
    });
  }
  htmlAImg(params) {
    return __async(this, null, function* () {
      return `<div ${this.cssClass("imgWrapper")}>${yield this.htmlAImgImage(
        params
      )}${yield this.htmlAImgTitle(params)}</div>`;
    });
  }
  htmlAImgTitle(params) {
    return __async(this, null, function* () {
      return `<h6>${escapeHtml(this.imageTitle(params))}</h6>`;
    });
  }
  htmlAImgImage(params) {
    return __async(this, null, function* () {
      const fullTitle = this.imageTitle(params);
      return `<img src="${escapeHtml(
        params.src
      )}" alt="${fullTitle}" title="${fullTitle}"${params.size ? ` class="${params.size}"` : ""}/>`;
    });
  }
  htmlH5Counter(counter, iteration, content, chapter, _section) {
    return __async(this, null, function* () {
      return `<h5>${yield this.htmlAnchor(
        `${counter}. ${content}`,
        `${chapter.anchor}-para-${counter}${iteration > 1 ? `-${iteration}` : ""}`
      )}</h5>`;
    });
  }
  htmlInPlaceReference(ref2, chapter, section, isSuccessiveRefs = false) {
    return __async(this, null, function* () {
      const anchor = escapeHtml(
        this.referenceBackAnchor(ref2, chapter, section)
      );
      return `<sup ${this.cssClass(
        "inPlaceReference"
      )}>${isSuccessiveRefs ? "\xB7" : ""}<a id="${anchor}" href="#${escapeHtml(
        this.referenceAnchor(ref2, chapter, section)
      )}">${ref2.counter}</a></sup>`;
    });
  }
  htmlExternalLink(href, text, cssClass = "externalLink") {
    return __async(this, null, function* () {
      return `<a target="_blank" ${this.cssClass(cssClass)} href="${escapeHtml(
        href
      )}">${text}</a>`;
    });
  }
  htmlChapterReferences(refs, chapter, section, bibliography, prependPath) {
    return __async(this, null, function* () {
      const refValues = [];
      for (let i = 0; i < refs.length; i++) {
        refValues.push(
          yield this.htmlReference(
            refs[i],
            i > 0 ? refs[i - 1] : null,
            chapter,
            section,
            bibliography,
            prependPath
          )
        );
      }
      return `<h4>${this.string("references")}</h4><ul ${this.cssClass(
        "references"
      )}>${refValues.map((v) => `<li>${v}</li>`).join("")}</ul>`;
    });
  }
  htmlReference(ref2, prevRef, chapter, section, bibliography, prependPath = "") {
    return __async(this, null, function* () {
      const anchor = escapeHtml(this.referenceAnchor(ref2, chapter, section));
      const link = yield this.htmlReferenceLink(ref2);
      return `<p><a ${this.cssClass("backAnchor")} href="${escapeHtml(
        prependPath
      )}#${escapeHtml(
        this.referenceBackAnchor(ref2, chapter, section)
      )}" id="${anchor}"><sup>${ref2.counter}</sup>&nbsp;</a><span>${isFieldDefined(ref2, "alt") ? yield this.htmlAltReference(ref2, prevRef, bibliography) : `${yield this.htmlReferenceText(
        ref2,
        prevRef,
        bibliography
      )}${link ? `<br/>${link}` : ""}</span>`}`;
    });
  }
  htmlReferenceLink(ref2, cssClass = "externalLink") {
    return __async(this, null, function* () {
      return ref2.href ? yield this.htmlExternalLink(
        ref2.href,
        escapeHtml(this.linkText(ref2.href)),
        cssClass
      ) : null;
    });
  }
  htmlReferenceText(ref2, prevRef, bibliography) {
    return __async(this, null, function* () {
      if (ref2.bibliographyItemAlias) {
        if (bibliography == null ? void 0 : bibliography[ref2.bibliographyItemAlias]) {
          return this.htmlReferenceBibliographyItem(
            ref2,
            prevRef,
            ref2.bibliographyItemAlias,
            bibliography[ref2.bibliographyItemAlias]
          );
        } else {
          this.context.logger.error(
            "Cannot find a bibliography item",
            ref2
          );
          return "[ERROR]";
        }
      } else {
        return ref2.text;
      }
    });
  }
  htmlAltReference(ref2, prevRef, bibliography) {
    return __async(this, null, function* () {
      var _a;
      const { alt } = ref2;
      if (!alt.bibliographyItemAlias && !alt.text) {
        this.context.logger.error(
          "Alt reference must contain either text or alias",
          ref2
        );
      }
      if (alt.bibliographyItemAlias && !(bibliography == null ? void 0 : bibliography[alt.bibliographyItemAlias])) {
        this.context.logger.error("Unknown alt bibliography alias", ref2);
      }
      const link = yield this.htmlReferenceLink(ref2, "referenceInlineLink");
      return `${this.string("referenceSee")} \u201C${yield this.htmlReferenceText(
        ref2,
        prevRef,
        bibliography
      )}\u201D${link ? ` &middot; ${link}` : ""} ${this.string("referenceOr")} ${alt.bibliographyItemAlias && (bibliography == null ? void 0 : bibliography[alt.bibliographyItemAlias]) ? yield this.htmlAltReferenceBibliographyItem(
        ref2,
        prevRef,
        alt.bibliographyItemAlias,
        bibliography[alt.bibliographyItemAlias]
      ) : escapeHtml((_a = alt.text) != null ? _a : "[ERROR]")}`;
    });
  }
  htmlReferenceBibliographyItem(ref2, prevRef, alias, item) {
    return __async(this, null, function* () {
      if (prevRef && prevRef.bibliographyItemAlias === ref2.bibliographyItemAlias) {
        return `${this.string("ibid")}${ref2.text ? `, ${escapeHtml(ref2.text)}` : ""}`;
      } else {
        return `<a ${this.cssClass(
          "refToBibliography"
        )} href="#${this.bibliographyItemAnchor(alias, item)}">${this.bibliographyItemShortName(
          item
        )}</a>${ref2.text ? `, ${escapeHtml(ref2.text)}` : ""}`;
      }
    });
  }
  htmlAltReferenceBibliographyItem(ref2, _prevRef, alias, item) {
    return __async(this, null, function* () {
      return `<a ${this.cssClass(
        "refToBibliography"
      )} href="#${this.bibliographyItemAnchor(alias, item)}">${this.bibliographyItemShortName(
        item
      )}</a>${ref2.alt.text ? `, ${escapeHtml(ref2.alt.text)}` : ""}`;
    });
  }
  htmlPageBreak() {
    return __async(this, null, function* () {
      return `<div ${this.cssClass("pageBreak")}></div>`;
    });
  }
  htmlCode(html, language) {
    return __async(this, null, function* () {
      return `<pre><code data-language="${escapeHtml(
        language
      )}">${html}</code></pre>`;
    });
  }
  htmlBibliography(bibliography) {
    return __async(this, null, function* () {
      const items = Object.entries(bibliography).map(([alias, item]) => ({
        title: this.bibliographyItemShortName(item),
        item,
        alias
      })).sort((a, b) => a.title < b.title ? -1 : 1);
      const htmlParts = [];
      for (const { item, alias } of items) {
        htmlParts.push(yield this.htmlBibliographyItem(alias, item));
      }
      return `<ul ${this.cssClass("bibliography")}>${htmlParts.map((i) => `<li>${i}</li>`).join("")}</ul>`;
    });
  }
  htmlBibliographyItem(alias, item) {
    return __async(this, null, function* () {
      var _a;
      const anchor = escapeHtml(this.bibliographyItemAnchor(alias, item));
      return `<p><a id="${anchor}">${yield this.htmlBibliographyItemFullName(
        item
      )}</a>${((_a = item.hrefs) == null ? void 0 : _a.length) ? `<br/>${yield this.htmlBibliographyHrefs(item.hrefs)}` : ""}</p>`;
    });
  }
  htmlBibliographyHrefs(hrefs) {
    return __async(this, null, function* () {
      const htmlParts = [];
      for (const href of hrefs) {
        const match = href.trim().match(/^\w+:/);
        const scheme = match ? match[0] : "unknown:";
        switch (scheme) {
          case "http:":
          case "https:":
            htmlParts.push(
              yield this.htmlExternalLink(
                href,
                escapeHtml(this.linkText(href))
              )
            );
            break;
          case "isbn:":
            htmlParts.push(
              `ISBN\xA0${escapeHtml(href.slice(5))}`
            );
            break;
          default:
            this.context.logger.error(
              "Cannot resolve hyperlink scheme",
              href
            );
            htmlParts.push(escapeHtml(href));
        }
      }
      return htmlParts.join("<br/>");
    });
  }
  htmlBibliographyItemFullName(item) {
    return __async(this, null, function* () {
      return `${escapeHtml(
        this.bibliographyItemShortName(item)
      )} ${yield this.htmlBibliographyItemTitle(item)}`;
    });
  }
  htmlBibliographyItemTitle(item) {
    return __async(this, null, function* () {
      var _a;
      const titleParts = [item.title, ...(_a = item.subtitle) != null ? _a : []].map(
        (part, index) => index % 2 ? escapeHtml(part) : `<em>${escapeHtml(part)}</em>`
      );
      return titleParts.join(". ");
    });
  }
  htmlEpubSectionContent(section) {
    return __async(this, null, function* () {
      const content = section.getContent();
      return this.htmlEpubDocument(content);
    });
  }
  htmlEpubChapterContent(chapter, _section) {
    return __async(this, null, function* () {
      return this.htmlEpubDocument(chapter.content);
    });
  }
  htmlEpubDocument(root) {
    return __async(this, null, function* () {
      return root ? astToHtml(root) : "";
    });
  }
  htmlPdfDocument(structure, css) {
    return __async(this, null, function* () {
      return this.htmlDocument(structure, css);
    });
  }
  htmlPdfHeaderTemplate() {
    return __async(this, null, function* () {
      return `<span style="text-align:center">${this.string(
        "author"
      )}. ${this.string("title")}</span>`;
    });
  }
  htmlPdfFooterTemplate() {
    return __async(this, null, function* () {
      return `<span class="pageNumber" style="text-align: center"></span>`;
    });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DEFAULT_OPTIONS,
  DefaultTemplates,
  LogLevel,
  Section,
  Structure,
  applyAstPluginToStructure,
  applyHastPluginToAst,
  createStatelessPlugin,
  escapeHtml,
  htmlToAst,
  htmlToAstElements,
  init,
  isElement,
  isElementContent,
  isTextNode,
  markdownToAst,
  plugins
});
