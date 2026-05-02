import * as Schema from "effect/Schema";

export class LineApiError extends Schema.TaggedError<LineApiError>(
  "LineApiError",
)("LineApiError", {
  cause: Schema.Unknown,
}) {}

export class LineRateLimitError extends Schema.TaggedError<LineRateLimitError>(
  "LineRateLimitError",
)("LineRateLimitError", {
  cause: Schema.Unknown,
}) {}

export class LineSignatureError extends Schema.TaggedError<LineSignatureError>(
  "LineSignatureError",
)("LineSignatureError", {
  cause: Schema.Unknown,
}) {}

export const AnyLineError = Schema.Union(
  LineApiError,
  LineRateLimitError,
  LineSignatureError,
);
export type AnyLineError = typeof AnyLineError.Type;
