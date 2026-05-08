import * as Core from "@mmlngl/effect-messagekit-core/domain";
import * as Schema from "effect/Schema";
import * as Domain from "./Domain";

export const LineUserSource = Schema.Struct({
  type: Schema.Literal("user"),
  userId: Core.User.UserIdentifier,
});

export const LineGroupSource = Schema.Struct({
  type: Schema.Literal("group"),
  groupId: Domain.GroupIdentifier,
  userId: Core.User.UserIdentifier,
});

export const LineRoomSource = Schema.Struct({
  type: Schema.Literal("room"),
  roomId: Domain.RoomIdentifier,
  userId: Core.User.UserIdentifier,
});

export const LineSource = Schema.Union(
  LineUserSource,
  LineGroupSource,
  LineRoomSource,
);

export type LineSource = typeof LineSource.Type;

export class WebhookEvent extends Schema.Class<WebhookEvent>("WebhookEvent")(
  {
    webhookEventId: Schema.NonEmptyTrimmedString,
    type: Schema.Literal("message"),
    deliveryContext: Schema.Struct({
      isRedelivery: Schema.Boolean,
    }),
    message: Schema.Struct({
      type: Schema.Literal("text"),
      id: Core.Messages.MessageIdentifier,
      text: Schema.String,
      quoteToken: Domain.QuoteToken,
      markAsReadToken: Schema.NonEmptyTrimmedString,
    }),
    timestamp: Schema.Number,
    source: LineSource.pipe(Schema.optional),
    replyToken: Domain.ReplyToken,
    mode: Schema.Literal("active"),
  },
  {
    title: "Line Webhook Event",
    description: "Represents a webhook event from the Line platform.",
  },
) {
  static decodeSingle = Schema.decodeUnknown(WebhookEvent);
  static decodeMultiple = (u: unknown[]) =>
    Schema.decodeUnknown(Schema.Array(WebhookEvent))(u);
}

export type WebhookEventType = typeof WebhookEvent.Type;
export type WebhookEventEncoded = Schema.Schema.Encoded<typeof WebhookEvent>;

export const LineWebhookBody = Schema.Struct({
  events: Schema.Array(WebhookEvent),
}).pipe(
  Schema.annotations({
    title: "Expected Reqest Body",
  }),
);

export type LineWebhookBodyType = typeof LineWebhookBody.Type;
