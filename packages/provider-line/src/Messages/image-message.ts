import * as Core from "@effect-messagekit/core";
import type * as Line from "@line/bot-sdk";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as Common from "./common";

export const LineImageMessage = Schema.TaggedStruct("LineImageMessage", {
  ...Common.fields,
  type: Schema.Literal("image"),
  originalContentUrl: Schema.NonEmptyTrimmedString,
  previewImageUrl: Schema.NonEmptyTrimmedString,
});

export type LineImageMessageType = typeof LineImageMessage.Type;

// Compile-time type checks to ensure compatibility with LINE SDK
const _assert: Line.messagingApi.ImageMessage = {} as LineImageMessageType;

export const presenter: Core.Domain.Presenter.PresenterTrait<LineImageMessageType> =
  {
    build: (messages) =>
      Effect.all(
        messages.map((msg) =>
          Schema.decodeUnknown(LineImageMessage)({
            type: "image",
            to: msg.recipient,
            originalContentUrl: "https://example.com/image.jpg",
            previewImageUrl: "https://example.com/preview.jpg",
          }),
        ),
      ).pipe(
        Effect.mapError(
          (cause) => new Core.Domain.Presenter.PresentBuildError({ cause }),
        ),
      ),
  };
