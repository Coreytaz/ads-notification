import { get } from "./get";

type GroupedResult<T> = Record<string | number | symbol, T[]>;

export const groupBy = <T>(
    xs: readonly T[],
    key: string,
): GroupedResult<T> => {
    return xs.reduce<GroupedResult<T>>((acc, item) => {
        const groupKey = get(item, key);

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (groupKey != null) {
            const keyAsProperty = groupKey as PropertyKey;
            acc[keyAsProperty] ??= [];
            acc[keyAsProperty].push(item);
        }

        return acc;
    }, {});
};