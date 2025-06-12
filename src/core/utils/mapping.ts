/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */

type ConditionFunction = (...args: any[]) => any;

export const mapping = (
  condition: keyof any,
  object: Record<keyof any, ConditionFunction>,
  _default: ConditionFunction | any,
  ...args: any[]
) => {
  if (object?.[condition]) {
    return object[condition](...args);
  }

  return typeof _default === "function" ? _default(...args) : _default;
};
