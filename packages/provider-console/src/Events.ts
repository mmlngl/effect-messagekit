import * as Core from "@mmlngl/effect-messagekit-core/domain";
import * as Schema from "effect/Schema";

export const WebhookEvent = Schema.Struct({
  timestamp: Schema.Number,
  userId: Core.User.UserIdentifier,
  contents: Schema.Unknown,
});

export type WebhookEventType = typeof WebhookEvent.Type;
export type WebhookEventEncoded = Schema.Schema.Encoded<typeof WebhookEvent>;

export const ConsoleWebhookBody = Schema.Struct({
  events: Schema.Array(WebhookEvent),
}).pipe(
  Schema.annotations({
    title: "Expected Reqest Body",
  }),
);

export type ConsoleWebhookBodyType = typeof ConsoleWebhookBody.Type;
