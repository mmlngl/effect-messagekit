import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type * as Messages from "./messages";

export type InboundMessageHandler<E = never, R = never> = (
  message: Messages.InboundMessage.Type,
) => Effect.Effect<void, E, R>;

export interface HandlerTrait {
  run: <E = never, R = never>(input: {
    request: Request;
    onMessage: InboundMessageHandler<E, R>;
  }) => Effect.Effect<Response, E, R>;
}

export class Handler extends Context.Tag("Handler")<Handler, HandlerTrait>() {
  static layer = Layer.effect(
    this,
    Effect.gen(function* () {
      yield* Effect.void;

      const run: HandlerTrait["run"] = Effect.fn("Handler.run")(
        function* (input) {
          yield* Effect.void;
          return new Response();
        },
      );

      return {
        run,
      } satisfies HandlerTrait;
    }),
  );
}
