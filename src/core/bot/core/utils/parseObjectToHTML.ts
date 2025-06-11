import {
  bold,
  code,
  expandableBlockquote,
  fmt,
  FormattedString,
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
  | ((stringLike: Stringable) => FormattedString)
  | ((stringLike: Stringable, language: string) => FormattedString)
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
      return mapOptions[key as keyof ParseObjectToHTMLOptions](acc, "");
    }
    return acc;
  }, value);
};

export const parseObjectToHTML = (
  obj: Record<string, ParseObjectToHTMLValue | undefined>,
) => {
  return fmt(
    [],
    ...Object.values(obj).map(value => {
      if (!value) return "";
      return fmt`${value.title}: ${applyOptions(value.value, value.options ?? {})}${value.separator?.() ?? "\n"}`;
    }),
  );
};
