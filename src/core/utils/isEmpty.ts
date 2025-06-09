export const isEmpty = (obj: any) =>
  // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
  [Object, Array].includes((obj ?? {}).constructor) &&
  !Object.entries(obj ?? {}).length;
