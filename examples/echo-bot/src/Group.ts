import * as P from "@effect/platform";
import * as Line from "@mmlngl/effect-messagekit-provider-line";
import * as Schema from "effect/Schema";

export const Payload = Schema.Struct({
  msg: Schema.NonEmptyTrimmedString,
});

export class EchoGroup extends P.HttpApiGroup.make("echo")
  .add(
    P.HttpApiEndpoint.post("line", "/line")
      .middleware(Line.Middleware.LineWebhookAuthorization)
      .addSuccess(Payload)
      .addError(Schema.String),
  )
  .prefix("/echo") {}
