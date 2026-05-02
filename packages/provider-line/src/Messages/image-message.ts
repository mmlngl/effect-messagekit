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

export const LineImageMessage = Schema.TaggedStruct("LineImageMessage", {
  ...Common.fields,
  type: Schema.Literal("image"),
  originalContentUrl: Schema.NonEmptyTrimmedString,
  previewImageUrl: Schema.NonEmptyTrimmedString,
});

export type LineImageMessageType = typeof LineImageMessage.Type;

// Compile-time type checks to ensure compatibility with LINE SDK
// These will cause build failures if types don't match
const _assertImageMessage: Line.messagingApi.ImageMessage =
  {} as LineImageMessageType;
