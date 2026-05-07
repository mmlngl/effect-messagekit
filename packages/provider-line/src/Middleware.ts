import * as P from "@effect/platform";
import { LINE_SIGNATURE_HTTP_HEADER_NAME } from "@line/bot-sdk";
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
        key: LINE_SIGNATURE_HTTP_HEADER_NAME,
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
            const body = yield* P.HttpServerRequest.HttpServerRequest.pipe(
              Effect.flatMap((request) => request.text),
              Effect.mapError(
                (cause) => new Errors.LineSignatureError({ cause }),
              ),
            );
            return yield* client.verifyToken(body, token).pipe(
              Effect.flatMap((isValid) =>
                Effect.if(isValid, {
                  onTrue: () => Effect.succeed(void 0),
                  onFalse: () =>
                    Effect.fail(
                      new Errors.LineSignatureError({ cause: "Invalid token" }),
                    ),
                }),
              ),
              Effect.mapError(
                (cause) => new Errors.LineSignatureError({ cause }),
              ),
            );
          }),
      };
    }),
  );
}
