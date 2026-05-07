import { LineBotClient, validateSignature } from "@line/bot-sdk";
import * as Domain from "@mmlngl/effect-messagekit-core/domain";
import * as Infra from "@mmlngl/effect-messagekit-core/infra";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Config from "./Config";
import type * as Messages from "./Messages";

export type LineClient = Domain.Client.ClientTrait<Messages.AnyLineMessage>;

export const LineClient = Context.GenericTag<LineClient>("LineClient");

export const layer = Layer.effect(
  LineClient,
  Effect.gen(function* () {
    const Uuid = yield* Infra.Uuid.UuidGen;
    const config = yield* Config.LineConfig;
    const client = LineBotClient.fromChannelAccessToken({
      channelAccessToken: Redacted.value(config.channelAccessToken),
    });

    const send: LineClient["send"] = Effect.fn("line-client.send")(
      function* (to, messages) {
        const retryKey = yield* Uuid.next;
        yield* Effect.tryPromise({
          try: () =>
            client.pushMessage(
              {
                to,
                messages: [...messages],
              },
              retryKey,
            ),
          catch: (cause) => new Domain.Client.ClientSendError({ cause }),
        });
      },
    );

    const verifyToken: LineClient["verifyToken"] = Effect.fn(
      "line-client.verifyToken",
    )(function* (body, token) {
      return yield* Effect.if(config.dangerouslySkipSignatureVerification, {
        onTrue: () =>
          Effect.succeed(true).pipe(
            Effect.tap(() =>
              Effect.logWarning(
                "dangerouslySkipSignatureVerification is enabled, skipping LINE signature verification",
              ),
            ),
          ),
        onFalse: () =>
          Effect.try({
            try: () =>
              validateSignature(
                body,
                Redacted.value(config.channelSecret),
                Redacted.value(token),
              ),
            catch: (cause) =>
              new Domain.Client.TokenVerificationError({ cause }),
          }),
      });
    });

    return LineClient.of({
      send,
      verifyToken,
    });
  }),
).pipe(
  Layer.provide(Infra.Uuid.layer),
  Layer.provide(Config.LineConfig.layerFromEnv),
);
