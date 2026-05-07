import type * as Line from "@line/bot-sdk";
import * as Schema from "effect/Schema";

export const FlexMessageContainerBubble = Schema.Struct({
  type: Schema.Literal("bubble"),
  direction: Schema.optionalWith(Schema.Literal("ltr", "rtl"), {
    exact: true,
  }),
  // styles?: FlexBubbleStyles
  // header?: FlexBox
  // hero?: FlexComponent
  // body?: FlexBox
  // footer?: FlexBox
  // size?: FlexBubble.SizeEnum
  // action?: Action
});

export const FlexMessageContainerCarousel = Schema.Struct({
  type: Schema.Literal("carousel"),
  contents: Schema.mutable(Schema.Array(FlexMessageContainerBubble)),
});

export const FlexMessageContainer = Schema.Union(
  FlexMessageContainerBubble,
  FlexMessageContainerCarousel,
);

export const FlexMessage = Schema.TaggedStruct("LineFlexMessage", {
  type: Schema.Literal("flex"),
  altText: Schema.NonEmptyTrimmedString,
  contents: FlexMessageContainer,
});

export type FlexMessageType = typeof FlexMessage.Type;

// Compile-time type checks to ensure compatibility with LINE SDK
const _assert: Line.messagingApi.FlexMessage = {} as FlexMessageType;
