import type * as Effect from "effect/Effect";
import type * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import type * as User from "./user";

export class ClientSendError extends Schema.TaggedError<ClientSendError>(
  "ClientSendError",
)("ClientSendError", {
  cause: Schema.Unknown,
}) {}

export class TokenVerificationError extends Schema.TaggedError<TokenVerificationError>(
  "TokenVerificationError",
)("TokenVerificationError", {
  cause: Schema.Unknown,
}) {}

export interface ClientTrait<TMessage> {
  send(
    recipient: User.UserIdentifierType,
    messages: ReadonlyArray<TMessage>,
  ): Effect.Effect<void, ClientSendError>;

  verifyToken(
    body: string | ArrayBuffer,
    token: Redacted.Redacted<string>,
  ): Effect.Effect<boolean, TokenVerificationError>;
}
