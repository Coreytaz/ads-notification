import {
  bold,
  code,
  EntityTag,
  expandableBlockquote,
  fmt,
  italic,
  pre,
  spoiler,
  strikethrough,
  Stringable,
  underline,
} from "@grammyjs/parse-mode";

import {
  ParseObjectToHTMLOptions,
  ParseObjectToHTMLValue,
} from "../interface/ParseObjectToHTML";

const mapOptions: Record<
  keyof ParseObjectToHTMLOptions,
  (() => EntityTag) | ((language: string) => EntityTag)
> = {
  bold,
  italic,
  underline,
  strikethrough,
  spoiler,
  code,
  pre,
  expandableBlockquote,
};

const applyOptions = (value: Stringable, options: ParseObjectToHTMLOptions) => {
  return Object.entries(options).reduce((acc, [key, val]) => {
    if (val) {
      const option = mapOptions[key as keyof ParseObjectToHTMLOptions];
      return fmt`${option}${acc}${option}`;
    }
    return acc;
  }, value);
};

export const parseObjectToHTML = (
  obj: Record<string, ParseObjectToHTMLValue | undefined>,
) => {
  return fmt`
    ${Object.values(obj).reduce((acc, value) => {
      if (!value) {
        return acc;
      }
      return `${acc}${String(fmt`${value.title}: ${applyOptions(value.value, value.options ?? {})}${value.separator?.() ?? "\n"}`)}`;
    }, "")}
  `;
};
