import * as P from "@effect/platform";
import * as Schema from "effect/Schema";

export class LineApiError extends Schema.TaggedError<LineApiError>(
  "LineApiError",
)(
  "LineApiError",
  {
    cause: Schema.Unknown,
  },
  P.HttpApiSchema.annotations({
    status: 500,
    title: "Line API Error",
    description: "Line returned an error",
  }),
) {}

export class WebhookDecodeError extends Schema.TaggedError<WebhookDecodeError>(
  "WebhookDecodeError",
)(
  "WebhookDecodeError",
  {
    cause: Schema.Unknown,
  },
  P.HttpApiSchema.annotations({
    status: 500,
    title: "Webhook Decode Error",
    description:
      "The server failed to decode the request body into a valid webhook payload.",
  }),
) {}

export class LineRateLimitError extends Schema.TaggedError<LineRateLimitError>(
  "LineRateLimitError",
)(
  "LineRateLimitError",
  {
    cause: Schema.Unknown,
  },
  P.HttpApiSchema.annotations({
    status: 500,
    title: "Line Rate Limit Error",
    description: "Line is rate limiting the server.",
  }),
) {}

export class LineSignatureError extends Schema.TaggedError<LineSignatureError>(
  "LineSignatureError",
)(
  "LineSignatureError",
  {
    cause: Schema.Unknown,
  },
  P.HttpApiSchema.annotations({
    status: 401,
    title: "Webhook Signature Error",
    description: "The request signature does not match the expected signature.",
  }),
) {}

export const AnyLineError = Schema.Union(
  LineApiError,
  LineRateLimitError,
  LineSignatureError,
);
export type AnyLineError = typeof AnyLineError.Type;
