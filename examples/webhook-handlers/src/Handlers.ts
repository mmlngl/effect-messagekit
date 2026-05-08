import * as P from "@effect/platform";
import * as Core from "@mmlngl/effect-messagekit-core/domain";
import * as Console from "@mmlngl/effect-messagekit-provider-console";
import * as Line from "@mmlngl/effect-messagekit-provider-line";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import * as Api from "./Api";

const LineMessage = Core.Messages.buildOutboundMessage(
  Line.Messages.TextMessage,
);
const ConsoleMessage = Core.Messages.buildOutboundMessage(
  Console.Messages.JsonMessage,
);

const timestampDecoder = Schema.decode(Schema.DateFromNumber);

export const EchoGroupHandlers = P.HttpApiBuilder.group(
  Api.ServerApi,
  "echo",
  (handlers) =>
    handlers
      .handle("line", ({ payload }) =>
        Line.WebhookHandler.make({
          payload,
          onEvents: Effect.fnUntraced(function* (events) {
            return yield* Effect.forEach(events, (event) =>
              Effect.gen(function* () {
                const timestamp = yield* timestampDecoder(event.timestamp);

                return Match.value(event).pipe(
                  Match.when({ source: { type: "user" } }, (s) =>
                    Option.some(
                      LineMessage.make({
                        timestamp,
                        id: Core.Messages.MessageIdentifier.make(s.message.id),
                        recipient: Core.User.UserIdentifier.make(
                          s.source.userId,
                        ),
                        content: Line.Messages.TextMessage.make({
                          text: s.message.text,
                          type: "text",
                        }),
                      }),
                    ),
                  ),
                  Match.orElse(() => Option.none()),
                );
              }),
            );
          }),
        }).pipe(
          Effect.mapError((cause) => cause.toString()),
          Effect.tap(() => Effect.log("message sent")),
        ),
      )
      .handle("console", ({ payload }) =>
        Console.WebhookHandler.make({
          payload,
          onEvents: Effect.fnUntraced(function* (events) {
            return yield* Effect.forEach(events, (event) =>
              Effect.gen(function* () {
                const timestamp = yield* timestampDecoder(event.timestamp);

                return Option.some(
                  ConsoleMessage.make({
                    timestamp,
                    id: Core.Messages.MessageIdentifier.make(
                      "51d7275a-8cc3-4097-b35f-33fc476838a6",
                    ),
                    recipient: event.userId,
                    content: Console.Messages.JsonMessage.make({
                      contents: String(event.contents),
                    }),
                  }),
                );
              }),
            );
          }),
        }).pipe(
          Effect.mapError((cause) => cause.toString()),
          Effect.tap(() => Effect.log("message sent")),
        ),
      ),
);
