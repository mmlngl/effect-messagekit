import * as Id from "@typed/id";
import * as Effect from "effect/Effect";

export class UuidGen extends Effect.Service<UuidGen>()("UuidGen", {
  accessors: true,
  effect: Effect.gen(function* () {
    yield* Effect.void;

    const next = Id.makeUuid4.pipe(
      Effect.provide([Id.GetRandomValues.CryptoRandom, Id.DateTimes.Default]),
    );

    return {
      next,
    } as const;
  }),
}) {}

export const layer = UuidGen.Default;
