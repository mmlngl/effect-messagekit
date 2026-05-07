import type * as Line from "@line/bot-sdk";
import * as Schema from "effect/Schema";

export const ImageMessage = Schema.TaggedStruct("LineImageMessage", {
  type: Schema.Literal("image"),
  originalContentUrl: Schema.NonEmptyTrimmedString,
  previewImageUrl: Schema.NonEmptyTrimmedString,
});

export type ImageMessageType = typeof ImageMessage.Type;

// Compile-time type checks to ensure compatibility with LINE SDK
const _assert: Line.messagingApi.ImageMessage = {} as ImageMessageType;
