import * as Core from "@effect-messagekit/core";
import * as Line from "@line/bot-sdk";
import type * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

type Service = Core.Application.Verify.WebhookVerificationServiceTrait;

export const Tag: Context.Tag<Service, Service> =
  Core.Application.Verify.make("LINE");

const make = Effect.gen(function* () {
  const verify: Core.Application.Verify.WebhookVerificationServiceTrait["verify"] =
    Effect.fn("Provider.line.verify")(function* (_input) {
      return yield* Effect.if(Line.validateSignature("a", "b", ""), {
        onTrue: () => Effect.void,
        onFalse: () =>
          Effect.fail(
            new Core.Application.Verify.WebhookVerificationError({
              cause: "Not yet implemented",
            }),
          ),
      });
    });

  return Tag.of({
    verify,
  });
});

export const layer: Layer.Layer<Service> = Layer.effect(Tag, make);
