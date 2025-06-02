type GetFieldType<T, P extends string> =
    P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
    ? GetFieldType<T[K], Rest>
    : undefined
    : P extends keyof T
    ? T[P]
    : undefined;

export const get = <T, P extends string>(
    obj: T,
    path: P,
    defaultValue?: GetFieldType<T, P>
): GetFieldType<T, P> => {
    const travel = (regexp: RegExp) =>
        String.prototype.split
            .call(path, regexp)
            .filter(Boolean)
            .reduce((res: any, key: string) => (res !== null && res !== undefined ? res[key] : res), obj);

    const result = travel(/[,[\]]+?/) ?? travel(/[,[\].]+?/);
    return (result === undefined || result === obj ? defaultValue : result) as GetFieldType<T, P>;
};