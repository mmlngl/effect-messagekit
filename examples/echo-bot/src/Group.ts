import * as P from "@effect/platform";
// import * as Line from "@effect-messagekit/provider-line";
import * as Schema from "effect/Schema";

export const Payload = Schema.Struct({
  msg: Schema.NonEmptyTrimmedString,
});

export class EchoGroup extends P.HttpApiGroup.make("echo")
  .add(
    P.HttpApiEndpoint.post("line", "/line")
      .addSuccess(Payload)
      .setPayload(Payload)
      .addError(Schema.String),
    //   .middleware(
    //   Line.Middleware.LineWebhookAuthorization,
    // ),
  )
  .prefix("/echo") {}
