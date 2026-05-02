import { createServer } from "node:http";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import * as P from "@effect/platform-node";
import * as Layer from "effect/Layer";
import * as Api from "./Api";
import * as Handlers from "./Handlers";

const ApiLayer = HttpApiBuilder.api(Api.ServerApi).pipe(
  Layer.provide([Handlers.EchoGroupHandlers]),
);

const HttpLive = HttpApiBuilder.serve().pipe(
  Layer.provide(ApiLayer),
  Layer.provide(P.NodeHttpServer.layer(createServer, { port: 3000 })),
);

P.NodeRuntime.runMain(Layer.launch(HttpLive));
