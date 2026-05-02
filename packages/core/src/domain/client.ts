import type * as Effect from "effect/Effect";
import type * as Messages from "./messages";

export interface ClientTrait<E = never, R = never> {
  presentMessage(
    message: Messages.OutboundMessageType,
  ): Effect.Effect<void, E, R>;
}
