import * as Line from "@line/bot-sdk";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";

export const make = Effect.gen(function* () {
  const LINE_CHANNEL_ACCESS_TOKEN = yield* Config.redacted(
    "CHANNEL_ACCESS_TOKEN",
  );

  const LINE_CHANNEL_SECRET = yield* Config.redacted("CHANNEL_SECRET");

  const client = Line.LineBotClient.fromChannelAccessToken({
    channelAccessToken: Redacted.value(LINE_CHANNEL_ACCESS_TOKEN),
  });

  Line.middleware({
    channelSecret: Redacted.value(LINE_CHANNEL_SECRET),
  });

  return client;
});

export class Client extends Context.Tag("Client")<
  Client,
  Line.LineBotClient
>() {
  static buildLayer = () => Layer.effect(Client, make);
}
