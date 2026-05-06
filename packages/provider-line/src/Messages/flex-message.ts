import type * as Line from "@line/bot-sdk";
import * as Core from "@mmlngl/effect-messagekit-core";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as Common from "./common";

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
  ...Common.fields,
  type: Schema.Literal("flex"),
  altText: Schema.NonEmptyTrimmedString,
  contents: LineFlexMessageContainer,
});

export type LineFlexMessageType = typeof LineFlexMessage.Type;

// Compile-time type checks to ensure compatibility with LINE SDK
const _assert: Line.messagingApi.FlexMessage = {} as LineFlexMessageType;

export const presenter: Core.Domain.Presenter.PresenterTrait<LineFlexMessageType> =
  {
    build: (messages) =>
      Effect.all(
        messages.map((msg) =>
          Schema.decodeUnknown(LineFlexMessage)({
            _tag: "LineFlexMessage",
            type: "flex",
            to: msg.recipient,
            altText: "Flex message",
            contents: LineFlexMessageContainerBubble.make({
              type: "bubble",
            }),
          }),
        ),
      ).pipe(
        Effect.mapError(
          (cause) => new Core.Domain.Presenter.PresentBuildError({ cause }),
        ),
      ),
  };
