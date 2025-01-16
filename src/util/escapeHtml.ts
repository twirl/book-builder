import escapehtml from 'escape-html';

import { HtmlString } from '../models/Types';

export const escapeHtml = (s: string) => escapehtml(s) as HtmlString;
