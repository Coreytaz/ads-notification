import type { link } from "@core/db/models";

export interface LinkCheckData {
  id: number;
  title: string | undefined;
  square: string | undefined;
  floor: string | undefined;
  maxFloor: string | undefined;
  price: string | undefined;
  house: string | undefined;
  street: string | undefined;
  sellerName: string | undefined;
  smallDescription: string | undefined;
}

export interface ComparisonResult<T extends object> {
  isEqual: boolean;
  differences: T;
}

export type LinkMapResult = Omit<typeof link.$inferInsert, "hash" | "id"> & {
  id: number;
};
