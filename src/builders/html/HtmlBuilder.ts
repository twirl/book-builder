import { Builder, initBuilder } from "../../models/Builder";

export class HtmlBuilder implements Builder {
  constructor() {
    const structure = {
      frontPage: options.sample
        ? templates.samplePage({ templates, l10n })
        : templates.frontPage({ templates, l10n }),
      sections: [],
      references: [],
    };
  }
}

export const initHtmlBuilder: initBuilder = () => new HtmlBuilder();
