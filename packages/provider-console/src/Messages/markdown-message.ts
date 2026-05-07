import * as Core from "@mmlngl/effect-messagekit-core";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as Common from "./common";

export const ConsoleMarkdownMessage = Schema.TaggedStruct(
  "ConsoleMarkdownMessage",
  {
    ...Common.fields,
    type: Schema.Literal("markdown"),
    contents: Schema.NonEmptyTrimmedString,
  },
);
export type ConsoleMarkdownMessageType = typeof ConsoleMarkdownMessage.Type;

export const presenter: Core.Domain.Presenter.PresenterTrait<ConsoleMarkdownMessageType> =
  {
    build: (messages) =>
      Effect.all(
        messages.map((msg) =>
          Schema.decode(ConsoleMarkdownMessage)({
            _tag: "ConsoleMarkdownMessage",
            type: "markdown",
            to: msg.recipient,
            contents: "# fake Markdown",
          }),
        ),
      ).pipe(
        Effect.mapError(
          (cause) => new Core.Domain.Presenter.PresentBuildError({ cause }),
        ),
      ),
  };
