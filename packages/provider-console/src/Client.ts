import type * as Domain from "@mmlngl/effect-messagekit-core/domain";
import * as Console from "effect/Console";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type * as Messages from "./Messages";

export type ConsoleClient =
  Domain.Client.ClientTrait<Messages.AnyConsoleMessage>;

export const ConsoleClient = Context.GenericTag<ConsoleClient>("ConsoleClient");

export const layer = Layer.effect(
  ConsoleClient,
  Effect.gen(function* () {
    yield* Effect.void;

    const send: ConsoleClient["send"] = Effect.fn("console-client.send")(
      function* (to, messages) {
        yield* Console.log({ to, messages });
      },
    );

    const verifyToken: ConsoleClient["verifyToken"] = Effect.fn(
      "console-client.verifyToken",
    )(function* () {
      return yield* Effect.succeed(true);
    });

    return ConsoleClient.of({
      send,
      verifyToken,
    });
  }),
);
