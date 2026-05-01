import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";

export class WebhookVerificationError extends Schema.TaggedError<WebhookVerificationError>(
  "WebhookVerificationError",
)("WebhookVerificationError", {
  cause: Schema.Unknown,
}) {}

export interface WebhookVerificationServiceTrait {
  verify: (input: {
    readonly request: Request;
    readonly rawBody: string;
  }) => Effect.Effect<void, WebhookVerificationError>;
}

export const make = (key: string) =>
  Context.GenericTag<WebhookVerificationServiceTrait>(
    `WebhookVerificationService-${key}`,
  );
