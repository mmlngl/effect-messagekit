import type * as Line from "@line/bot-sdk";
import * as Schema from "effect/Schema";

export const LineTextMessage = Schema.TaggedStruct("LineTextMessage", {
  type: Schema.Literal("text"),
  text: Schema.NonEmptyTrimmedString,
  quoteToken: Schema.optionalWith(Schema.NonEmptyTrimmedString, {
    exact: true,
  }),
});

export type LineTextMessageType = typeof LineTextMessage.Type;

// Compile-time type checks to ensure compatibility with LINE SDK
const _assert: Line.messagingApi.TextMessage = {} as LineTextMessageType;
