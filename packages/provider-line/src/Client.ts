import { Domain, Infra } from "@effect-messagekit/core";
import { LineBotClient, validateSignature } from "@line/bot-sdk";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Config from "./Config";
import type * as Messages from "./Messages";

export type LineClientTrait =
  Domain.Client.ClientTrait<Messages.AnyLineMessageType>;

export class LineClient extends Context.Tag("LineClient")<
  LineClient,
  LineClientTrait
>() {
  static readonly layer = Layer.effect(
    LineClient,
    Effect.gen(function* () {
      const Uuid = yield* Infra.Uuid.UuidGen;
      const config = yield* Config.LineConfig;
      const client = LineBotClient.fromChannelAccessToken({
        channelAccessToken: Redacted.value(config.channelAccessToken),
      });

      const verifyToken: LineClientTrait["verifyToken"] = Effect.fn(
        "line.verifyToken",
      )(function* (body, token) {
        return yield* Effect.try(() =>
          validateSignature(
            body,
            Redacted.value(config.channelSecret),
            Redacted.value(token),
          ),
        ).pipe(Effect.catchAll(() => Effect.succeed(false)));
      });

      const presentMessages: LineClientTrait["presentMessages"] = Effect.fn(
        "line.presentMessages",
      )(function* (messages, presenter) {
        const lineMessages = yield* presenter.build(messages);

        const grouped = new Map<string, Messages.AnyLineMessageType[]>();
        for (const msg of lineMessages) {
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
            const retryKey = yield* Uuid.next;
            return Effect.tryPromise({
              try: () =>
                client.pushMessage(
                  {
                    to,
                    messages,
                  },
                  retryKey,
                ),
              catch: (cause) =>
                new Domain.Presenter.PresentBuildError({ cause }),
            });
          }),
          {
            concurrency: "inherit",
          },
        );

        return lineMessages;
      });

      return { presentMessages, verifyToken };
    }).pipe(Effect.provide(Infra.Uuid.layer)),
  );
}
