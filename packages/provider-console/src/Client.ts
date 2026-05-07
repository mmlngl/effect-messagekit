import type { Domain } from "@mmlngl/effect-messagekit-core";
import * as Console from "effect/Console";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type * as Messages from "./Messages";

export type ConsoleClientTrait =
  Domain.Client.ClientTrait<Messages.AnyConsoleMessageType>;

export class ConsoleClient extends Context.Tag("ConsoleClient")<
  ConsoleClient,
  ConsoleClientTrait
>() {
  static readonly layer = Layer.effect(
    ConsoleClient,
    Effect.gen(function* () {
      yield* Effect.void;

      const verifyToken: ConsoleClientTrait["verifyToken"] = Effect.fn(
        "console-client.verifyToken",
      )(function* () {
        yield* Effect.void;
        return true;
      });

      const presentMessages: ConsoleClientTrait["presentMessages"] = Effect.fn(
        "console-client.presentMessages",
      )(function* (messages, presenter) {
        const consoleMessages = yield* presenter.build(messages);

        const grouped = new Map<string, Messages.AnyConsoleMessageType[]>();
        for (const msg of consoleMessages) {
          const to = msg.to;
          if (!grouped.has(to)) {
            grouped.set(to, []);
          }
          // biome-ignore lint/style/noNonNullAssertion: S'fine
          grouped.get(to)!.push(msg);
        }

        yield* Effect.forEach(
          grouped.entries(),
          Effect.fnUntraced(function* ([to, messages]) {
            return yield* Console.log({
              to,
              messages,
            });
          }),
          {
            concurrency: "inherit",
          },
        );

        return consoleMessages;
      });

      return { presentMessages, verifyToken };
    }),
  );
}
