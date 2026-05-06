import * as P from "@effect/platform";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Client from "./Client";
import * as Errors from "./Errors";

export class LineWebhookAuthorization extends P.HttpApiMiddleware.Tag<LineWebhookAuthorization>()(
  "LineWebhookAuthorization",
  {
    failure: Errors.LineSignatureError,
    security: {
      signature: P.HttpApiSecurity.apiKey({
        in: "header",
        key: "X-Line-Signature",
      }),
    },
  },
) {
  static layer = Layer.effect(
    LineWebhookAuthorization,
    Effect.gen(function* () {
      const client = yield* Client.LineClient;
      return {
        signature: (token) =>
          Effect.gen(function* () {
            const request = yield* P.HttpServerRequest.HttpServerRequest;
            const body = yield* request.text;
            return client
              .verifyToken(body, token)
              .pipe(
                Effect.flatMap((result) =>
                  result
                    ? Effect.succeed(true)
                    : Effect.fail(new Error("Invalid token")),
                ),
              );
          }).pipe(
            Effect.mapError(
              (cause) => new Errors.LineSignatureError({ cause }),
            ),
          ),
      };
    }),
  );
}
