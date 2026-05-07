import * as P from "@effect/platform";
import * as Core from "@mmlngl/effect-messagekit-core/domain";
import * as Console from "@mmlngl/effect-messagekit-provider-console";
import * as Line from "@mmlngl/effect-messagekit-provider-line";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as Api from "./Api";
import { Payload } from "./Group";

const userId = Core.User.UserIdentifier.make("user-id");

export const EchoGroupHandlers = P.HttpApiBuilder.group(
  Api.ServerApi,
  "echo",
  (handlers) =>
    handlers
      .handle("line", ({ request }) =>
        Effect.gen(function* () {
          const body = yield* request.json.pipe(
            Effect.mapError((cause) => cause.toString()),
          );

          const payload = yield* Schema.decodeUnknown(Payload)(body).pipe(
            Effect.mapError((cause) => cause.toString()),
          );

          const client = yield* Line.Client.LineClient;

          const messages = [
            Line.Messages.TextMessage.LineTextMessage.make({
              type: "text",
              text: payload.msg,
            }),
          ];

          yield* client.send(userId, messages).pipe(
            Effect.mapError((cause) => cause.toString()),
            Effect.tap(() => Effect.log("message sent")),
          );

          return Payload.make({ msg: payload.msg });
        }),
      )
      .handle("console", ({ request }) =>
        Effect.gen(function* () {
          const body = yield* request.json.pipe(
            Effect.mapError((cause) => cause.toString()),
          );

          const payload = yield* Schema.decodeUnknown(Payload)(body).pipe(
            Effect.mapError((cause) => cause.toString()),
          );

          const client = yield* Console.Client.ConsoleClient;

          const messages = [
            Console.Messages.JsonMessage.ConsoleJsonMessage.make({
              contents: payload.msg,
            }),
          ];

          yield* client.send(userId, messages).pipe(
            Effect.mapError((cause) => cause.toString()),
            Effect.tap(() => Effect.log("message sent")),
          );

          return Payload.make({ msg: payload.msg });
        }),
      ),
);
