import type * as Line from "@line/bot-sdk";
import * as Schema from "effect/Schema";

export const LineFlexMessageContainerBubble = Schema.Struct({
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

export const LineFlexMessageContainerCarousel = Schema.Struct({
  type: Schema.Literal("carousel"),
  contents: Schema.mutable(Schema.Array(LineFlexMessageContainerBubble)),
});

export const LineFlexMessageContainer = Schema.Union(
  LineFlexMessageContainerBubble,
  LineFlexMessageContainerCarousel,
);

export const LineFlexMessage = Schema.TaggedStruct("LineFlexMessage", {
  type: Schema.Literal("flex"),
  altText: Schema.NonEmptyTrimmedString,
  contents: LineFlexMessageContainer,
});

export type LineFlexMessageType = typeof LineFlexMessage.Type;

// Compile-time type checks to ensure compatibility with LINE SDK
const _assert: Line.messagingApi.FlexMessage = {} as LineFlexMessageType;
