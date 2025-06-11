import { RawApi } from "grammy";

export type Payload<M extends Methods<R>, R extends RawApi> = M extends unknown
  ? R[M] extends (signal?: AbortSignal) => unknown
    ? object
    : R[M] extends (args: any, signal?: AbortSignal) => unknown
      ? Parameters<R[M]>[0]
      : never
  : never;

export type Methods<R extends RawApi> = string & keyof R;

export type OtherApi<
  R extends RawApi,
  M extends Methods<R>,
  X extends string = never,
> = Omit<Payload<M, R>, X>;

export type Other<
  M extends Methods<RawApi>,
  X extends string = never,
> = OtherApi<RawApi, M, X>;
