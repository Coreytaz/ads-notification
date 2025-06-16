type StringKeyOf<T> = Extract<keyof T, string>;

export class CompositeKeyMap<T extends object> {
  private readonly storage: Record<string, T>;
  private readonly keyFields: StringKeyOf<T>[];

  constructor(
    items: readonly T[],
    keyFields: StringKeyOf<T>[] = Object.keys(
      items[0] || {},
    ) as StringKeyOf<T>[],
  ) {
    if (items.length === 0 && keyFields.length === 0) {
      throw new Error("Cannot determine key fields from empty array");
    }

    this.keyFields = keyFields;
    this.storage = Object.create(null);

    for (const item of items) {
      const key = this.buildKey(item);
      this.storage[key] = item;
    }
  }

  private buildKey(item: Record<StringKeyOf<T>, unknown>): string {
    return this.keyFields
      .map(field => {
        const value = item[field];
        if (value == null) {
          throw new Error(`Missing key field "${String(field)}" in item`);
        }
        return String(value);
      })
      .join("_");
  }

  /**
   * Получает значение по ключевым полям
   * @param query Объект содержащий только ключевые поля
   */
  get(query: Record<StringKeyOf<T>, unknown>): T | undefined {
    try {
      const key = this.buildKey(query);
      return this.storage[key];
    } catch {
      return undefined;
    }
  }

  getAll(): Readonly<Record<string, T>> {
    return this.storage;
  }

  static create<T extends object>(
    items: readonly T[],
    keyFields?: StringKeyOf<T>[],
  ): CompositeKeyMap<T> {
    return new CompositeKeyMap(items, keyFields);
  }
}
