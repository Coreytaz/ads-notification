import { rules } from "@core/db/models";

export const reduceRules = (_rules: (typeof rules.$inferSelect)[]) => {
  return _rules.reduce<Record<string, typeof rules.$inferSelect>>((acc, rule) => {
    if (rule.route !== null) {
      acc[rule.route] = rule;
    }
    return acc;
  }, {});
};
