import { FormattedString } from "@grammyjs/parse-mode"

export interface ParseObjectToHTMLOptions {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  spoiler?: boolean
  code?: boolean
  expandableBlockquote?: boolean
  pre?: boolean
}

export interface ParseObjectToHTMLValue {
  title: string;
  value: string | FormattedString;
  options?: ParseObjectToHTMLOptions;
  separator?: () => string;
}