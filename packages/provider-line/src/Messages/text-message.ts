import type * as Line from "@line/bot-sdk";
import * as Core from "@mmlngl/effect-messagekit-core";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as Common from "./common";

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
const _assert: Line.messagingApi.TextMessage = {} as LineTextMessageType;

export const presenter: Core.Domain.Presenter.PresenterTrait<LineTextMessageType> =
  {
    build: (messages) =>
      Effect.all(
        messages.map((msg) =>
          Schema.decodeUnknown(LineTextMessage)({
            _tag: "LineTextMessage",
            type: "text",
            to: msg.recipient,
            text: "Fake content",
          }),
        ),
      ).pipe(
        Effect.mapError(
          (cause) => new Core.Domain.Presenter.PresentBuildError({ cause }),
        ),
      ),
  };
