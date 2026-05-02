import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import type * as Events from "./events";

export type EventHandler<E = never, R = never> = (
  event: Events.BaseEvent.Type,
) => Effect.Effect<Response, E, R>;

export interface HandlerTrait {
  run: <E = never, R = never>(input: {
    request: Request;
    onEvent: EventHandler<E, R>;
  }) => Effect.Effect<Response, E, R>;
}

export class Handler extends Context.Tag("Handler")<Handler, HandlerTrait>() {}
