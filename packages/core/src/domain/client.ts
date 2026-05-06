import type * as Effect from "effect/Effect";
import type * as Redacted from "effect/Redacted";
import type * as Messages from "./messages";
import type * as Presenter from "./presenter";

export interface ClientTrait<T> {
  presentMessages(
    messages: readonly Messages.OutboundMessageType[],
    presenter: Presenter.PresenterTrait<T>,
  ): Effect.Effect<readonly T[], Presenter.PresentBuildError>;

  verifyToken(
    body: string | ArrayBuffer,
    token: Redacted.Redacted<string>,
  ): Effect.Effect<boolean>;
}
