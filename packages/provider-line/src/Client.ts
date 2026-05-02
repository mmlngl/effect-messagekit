import type { Domain } from "@effect-messagekit/core";
import * as Line from "@line/bot-sdk";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Schema from "effect/Schema";
import * as Config from "./Config";
import * as Errors from "./Errors";
import * as Messages from "./Messages/Messages";

export type LineClientType = Domain.Client.ClientTrait<Errors.AnyLineError>;

export const make = Effect.gen(function* () {
  const config = yield* Config.LineConfig;
  const encoder = Schema.encode(Messages.OutboundMessageFromLineMessage);
  const client = Line.LineBotClient.fromChannelAccessToken({
    channelAccessToken: Redacted.value(config.channelAccessToken),
  });

  const presentMessage: LineClientType["presentMessage"] = Effect.fn(
    "LineClient.presentMessage",
  )(function* (message) {
    const encoded = yield* encoder(message).pipe(
      Effect.mapError((cause) => new Errors.LineApiError({ cause })),
    );

    yield* Effect.tryPromise({
      try: () =>
        client.pushMessage(
          {
            to: message.recipient,
            messages: [encoded],
          },
          // Use message id as retry key
          message.id,
        ),
      catch: (cause) => new Errors.LineApiError({ cause }),
    });
  });

  return {
    presentMessage,
  } satisfies LineClientType;
});

export class LineClient extends Context.Tag("LineClient")<
  LineClient,
  LineClientType
>() {
  static readonly layer = Layer.effect(this, make);
}
