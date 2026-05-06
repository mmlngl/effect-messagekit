import { createServer } from "node:http";
import * as Dotenv from "@dotenvx/dotenvx";
import * as P from "@effect/platform";
import * as N from "@effect/platform-node";
import * as Line from "@mmlngl/effect-messagekit-provider-line";
import * as Layer from "effect/Layer";
import * as Api from "./Api";
import * as Clients from "./Clients";
import * as Handlers from "./Handlers";

Dotenv.config();

const ApiLayer = P.HttpApiBuilder.api(Api.ServerApi)
  .pipe(Layer.provide([Handlers.EchoGroupHandlers]))
  .pipe(Layer.provide(Clients.clientsLayer));

const middlewareLayer = Layer.mergeAll(
  Line.Middleware.LineWebhookAuthorization.layer.pipe(
    Layer.provide(Clients.clientsLayer),
  ),
);

const builtLayer = Layer.provide(ApiLayer, middlewareLayer);

const HttpLive = P.HttpApiBuilder.serve(P.HttpMiddleware.logger).pipe(
  Layer.provide(builtLayer),
  P.HttpServer.withLogAddress,
  Layer.provide(N.NodeHttpServer.layer(createServer, { port: 8787 })),
);

N.NodeRuntime.runMain(Layer.launch(HttpLive));
