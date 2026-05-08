import * as P from "@effect/platform";
import * as Console from "@mmlngl/effect-messagekit-provider-console";
import * as Line from "@mmlngl/effect-messagekit-provider-line";
import * as Schema from "effect/Schema";

export class EchoGroup extends P.HttpApiGroup.make("echo")
  .add(
    P.HttpApiEndpoint.post("line", "/line")
      .middleware(Line.Middleware.LineWebhookAuthorization)
      .setPayload(Line.Events.LineWebhookBody)
      .addError(Schema.String),
  )
  .add(
    P.HttpApiEndpoint.post("console", "/console")
      .setPayload(Console.Events.ConsoleWebhookBody)
      .addError(Schema.String),
  )
  .prefix("/webhooks") {}
