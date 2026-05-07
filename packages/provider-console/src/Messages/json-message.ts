import * as Core from "@mmlngl/effect-messagekit-core";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as Common from "./common";

export const ConsoleJsonMessage = Schema.TaggedStruct("ConsoleJsonMessage", {
  ...Common.fields,
  type: Schema.Literal("json"),
  contents: Schema.NonEmptyTrimmedString,
});
export type ConsoleJsonMessageType = typeof ConsoleJsonMessage.Type;

export const presenter: Core.Domain.Presenter.PresenterTrait<ConsoleJsonMessageType> =
  {
    build: (messages) =>
      Effect.all(
        messages.map((msg) =>
          Schema.decode(ConsoleJsonMessage)({
            _tag: "ConsoleJsonMessage",
            type: "json",
            to: msg.recipient,
            contents: "Fake content",
          }),
        ),
      ).pipe(
        Effect.mapError(
          (cause) => new Core.Domain.Presenter.PresentBuildError({ cause }),
        ),
      ),
  };
