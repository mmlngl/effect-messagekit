import * as P from "@effect/platform";
import * as Schema from "effect/Schema";

export class LineApiError extends Schema.TaggedError<LineApiError>(
  "LineApiError",
)(
  "LineApiError",
  {
    cause: Schema.Unknown,
  },
  P.HttpApiSchema.annotations({ status: 500 }),
) {}

export class LineRateLimitError extends Schema.TaggedError<LineRateLimitError>(
  "LineRateLimitError",
)(
  "LineRateLimitError",
  {
    cause: Schema.Unknown,
  },
  P.HttpApiSchema.annotations({ status: 500 }),
) {}

export class LineSignatureError extends Schema.TaggedError<LineSignatureError>(
  "LineSignatureError",
)(
  "LineSignatureError",
  {
    cause: Schema.Unknown,
  },
  P.HttpApiSchema.annotations({ status: 401 }),
) {}

export const AnyLineError = Schema.Union(
  LineApiError,
  LineRateLimitError,
  LineSignatureError,
);
export type AnyLineError = typeof AnyLineError.Type;
