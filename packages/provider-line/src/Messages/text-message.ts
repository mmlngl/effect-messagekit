import type * as Line from "@line/bot-sdk";
import * as Schema from "effect/Schema";
import * as Common from "./common";

// ***************
// INBOUND
// ***************

// Code here…

// ***************
// OUTBOUND
// ***************

export const LineTextMessage = Schema.TaggedStruct("LineTextMessage", {
  ...Common.fields,
  type: Schema.Literal("text"),
  text: Schema.NonEmptyTrimmedString,
  quoteToken: Schema.optionalWith(Schema.NonEmptyTrimmedString, {
    exact: true,
  }),
});
export type LineTextMessageType = typeof LineTextMessage.Type;

// Compile-time type checks to ensure compatibility with LINE SDK
// These will cause build failures if types don't match
const _assertTextMessage: Line.messagingApi.TextMessage =
  {} as LineTextMessageType;
