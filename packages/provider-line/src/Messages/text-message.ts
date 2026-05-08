import type * as Line from "@line/bot-sdk";
import * as Schema from "effect/Schema";
import * as Domain from "../Domain";

export const TextMessage = Schema.TaggedStruct("LineTextMessage", {
  type: Schema.Literal("text"),
  text: Schema.NonEmptyTrimmedString,
  quoteToken: Schema.optionalWith(Domain.QuoteToken, {
    exact: true,
  }),
});

export type TextMessageType = typeof TextMessage.Type;

// Compile-time type checks to ensure compatibility with LINE SDK
const _assert: Line.messagingApi.TextMessage = {} as TextMessageType;
