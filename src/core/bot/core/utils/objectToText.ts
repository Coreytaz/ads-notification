export const objectToText = (
  obj: Record<
    string,
    {
      value?: string | number;
      label: string;
    }
  >,
) => {
  return Object.values(obj).reduce(
    (acc, value) =>
      value.value ? `${acc}${value.label}: ${value.value}\n` : acc,
    "",
  );
};
