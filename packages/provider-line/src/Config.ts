import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type * as Redacted from "effect/Redacted";

export interface LineConfigTrait {
  channelAccessToken: Redacted.Redacted;
  channelSecret: Redacted.Redacted;
  dangerouslySkipSignatureVerification: boolean;
}

export const make = Effect.gen(function* () {
  const LINE_CHANNEL_ACCESS_TOKEN = yield* Config.redacted(
    "LINE_CHANNEL_ACCESS_TOKEN",
  );

  const LINE_CHANNEL_SECRET = yield* Config.redacted("LINE_CHANNEL_SECRET");

  const DANGEROUSLY_SKIP_LINE_SIGNATURE_VERIFICATION = yield* Config.boolean(
    "DANGEROUSLY_SKIP_LINE_SIGNATURE_VERIFICATION",
  ).pipe(Config.withDefault(false));

  return {
    channelAccessToken: LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: LINE_CHANNEL_SECRET,
    dangerouslySkipSignatureVerification:
      DANGEROUSLY_SKIP_LINE_SIGNATURE_VERIFICATION,
  } satisfies LineConfigTrait;
});

export class LineConfig extends Context.Tag("LineConfig")<
  LineConfig,
  LineConfigTrait
>() {
  static layerFromEnv = Layer.effect(LineConfig, make);
  static layerFromConfig = (input: LineConfigTrait) =>
    Layer.succeed(LineConfig, input);
}
