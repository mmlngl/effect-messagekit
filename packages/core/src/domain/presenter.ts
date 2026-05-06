import type * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import type * as Messages from "./messages";

export class PresentBuildError extends Schema.TaggedError<PresentBuildError>(
  "PresentBuildError",
)("PresentBuildError", {
  cause: Schema.Unknown,
}) {}

export interface PresenterTrait<T> {
  build: (
    messages: readonly Messages.OutboundMessageType[],
  ) => Effect.Effect<readonly T[], PresentBuildError>;
}
