import * as P from "@effect/platform";
import * as Core from "@mmlngl/effect-messagekit-core";
import * as Line from "@mmlngl/effect-messagekit-provider-line";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as Api from "./Api";
import { Payload } from "./Group";

export const EchoGroupHandlers = P.HttpApiBuilder.group(
  Api.ServerApi,
  "echo",
  (handlers) =>
    handlers.handle("line", ({ request }) =>
      Effect.gen(function* () {
        const body = yield* request.json.pipe(
          Effect.mapError((cause) => cause.toString()),
        );

        const payload = yield* Schema.decodeUnknown(Payload)(body).pipe(
          Effect.mapError((cause) => cause.toString()),
        );

        const presenter = Line.Messages.TextMessage.presenter;
        const client = yield* Line.Client.LineClient;

        const dummyMessage = Core.Domain.Messages.OutboundMessage.make({
          id: Core.Domain.Messages.MessageIdentifier.make(
            "d2109887-0589-4ead-99bb-d938f8dff72d",
          ),
          incomingMessageId: Core.Domain.Messages.MessageIdentifier.make(
            "35f1e4a9-c52d-451a-8d22-d2470cbdba09",
          ),
          provider: Core.Domain.Providers.ProviderIdentifier.make("LINE"),
          recipient: Core.Domain.User.UserIdentifier.make("user-1"),
          timestamp: new Date(),
        });

        yield* client.presentMessages([dummyMessage], presenter).pipe(
          Effect.tap(() => Effect.log("messages presented")),
          Effect.mapError((cause) => cause.toString()),
        );

        return Payload.make({
          msg: payload.msg,
        });
      }),
    ),
);
