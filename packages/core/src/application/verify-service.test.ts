import { expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import * as Verify from "./verify-service";

const Tag = Verify.make("test");

const make = Tag.of({
  verify: Effect.fnUntraced(function* () {
    return yield* Effect.fail(
      new Verify.WebhookVerificationError({
        cause: "Invalid webhook signature",
      }),
    );
  }),
});

const layer = Layer.succeed(Tag, make);

it.effect("test failure", () =>
  Effect.gen(function* () {
    const Verifier = yield* Tag;
    const failingResultExit = yield* Verifier.verify({
      request: new Request("https://example.com"),
      rawBody: "",
    }).pipe(Effect.exit);
    expect(failingResultExit).toStrictEqual(
      Exit.fail(
        new Verify.WebhookVerificationError({
          cause: "Invalid webhook signature",
        }),
      ),
    );
  }).pipe(Effect.provide(layer)),
);
