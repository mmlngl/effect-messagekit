import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Effect from "effect/Effect";
import * as Api from "./Api";

export const EchoGroupHandlers = HttpApiBuilder.group(
  Api.ServerApi,
  "echo",
  (handlers) =>
    handlers.handle("echo", () =>
      Effect.succeed(HttpServerResponse.text("Hello")),
    ),
);
