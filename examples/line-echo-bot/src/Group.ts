import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as Schema from "effect/Schema";

export class EchoGroup extends HttpApiGroup.make("echo").add(
  HttpApiEndpoint.get("echo")`/`.addSuccess(Schema.String),
) {}
