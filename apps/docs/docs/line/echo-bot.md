---
sidebar_position: 1
---

# Echo Bot

Complete reference implementation for a LINE webhook bot. Handles incoming messages, validates signatures, and replies using a presenter.

Full source: [`examples/echo-bot`](https://github.com/mmlngl/effect-messagekit/tree/main/examples/echo-bot)

## Environment Variables

Create a `.env` file:

```bash
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
LINE_CHANNEL_SECRET=your_channel_secret

# Optional – skip signature check during local dev only
# DANGEROUSLY_SKIP_LINE_SIGNATURE_VERIFICATION=true
```

## Define the API Group

`Group.ts` declares the endpoint and attaches the LINE signature middleware:

```typescript
import * as P from "@effect/platform";
import * as Line from "@mmlngl/effect-messagekit-provider-line";
import * as Schema from "effect/Schema";

// Response schema for the webhook endpoint
export const Payload = Schema.Struct({
  msg: Schema.NonEmptyTrimmedString,
});

export class EchoGroup extends P.HttpApiGroup.make("echo")
  .add(
    P.HttpApiEndpoint.post("line", "/line")
      // Attach LINE signature validation middleware
      .middleware(Line.Middleware.LineWebhookAuthorization)
      .addSuccess(Payload)
      .addError(Schema.String),
  )
  .prefix("/echo") {}
```

## Build the Client Layer

`Clients.ts` constructs the LINE client from environment variables:

```typescript
import * as Line from "@mmlngl/effect-messagekit-provider-line";
import * as Layer from "effect/Layer";

const lineClientLayer = Line.Client.LineClient.layer.pipe(
  Layer.provide(Line.Config.LineConfig.layerFromEnv),
);

export const clientsLayer = Layer.mergeAll(lineClientLayer);
```

`LineConfig.layerFromEnv` reads `LINE_CHANNEL_ACCESS_TOKEN` and `LINE_CHANNEL_SECRET` from the process environment via Effect's `Config` module.

## Write the Handler

`Handlers.ts` contains the business logic:

```typescript
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
        // 1. Parse the request body
        const body = yield* request.json.pipe(
          Effect.mapError((cause) => cause.toString()),
        );

        // 2. Decode into the expected schema
        const payload = yield* Schema.decodeUnknown(Payload)(body).pipe(
          Effect.mapError((cause) => cause.toString()),
        );

        // 3. Build an outbound message
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

        // 4. Choose a presenter and send via the LINE client
        const presenter = Line.Messages.TextMessage.presenter;
        const client = yield* Line.Client.LineClient;

        yield* client.presentMessages([dummyMessage], presenter).pipe(
          Effect.tap(() => Effect.log("messages presented")),
          Effect.mapError((cause) => cause.toString()),
        );

        return Payload.make({ msg: payload.msg });
      }),
    ),
);
```

### Signature Validation

By the time the handler runs, `LineWebhookAuthorization` has already validated the `X-Line-Signature` header. No manual verification is needed inside the handler.

```
Request arrives
  → LineWebhookAuthorization validates signature
  → Reads raw request body
  → Calls validateSignature(body, channelSecret, signature)
  → Invalid → fails with LineSignatureError (HTTP 401)
  → Valid   → handler proceeds
```

### Replying with a Presenter

Presenters convert domain `OutboundMessage` objects into platform-specific message payloads. `Line.Messages.TextMessage.presenter` builds `LineTextMessage` objects that the client sends via the LINE Messaging API:

```typescript
const presenter = Line.Messages.TextMessage.presenter;
yield * client.presentMessages([outboundMessage], presenter);
```

The presenter is a pure function — swap it for `Line.Messages.FlexMessage.presenter` or a custom presenter without touching the handler structure.

## Wire the Server

`main.ts` composes all layers and launches the HTTP server:

```typescript
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

// Build the API layer, providing handler and client dependencies
const ApiLayer = P.HttpApiBuilder.api(Api.ServerApi)
  .pipe(Layer.provide([Handlers.EchoGroupHandlers]))
  .pipe(Layer.provide(Clients.clientsLayer));

// Build the middleware layer
const middlewareLayer = Layer.mergeAll(
  Line.Middleware.LineWebhookAuthorization.layer.pipe(
    Layer.provide(Clients.clientsLayer),
  ),
);

// Merge API and middleware
const builtLayer = Layer.provide(ApiLayer, middlewareLayer);

// Serve on port 8787
const HttpLive = P.HttpApiBuilder.serve(P.HttpMiddleware.logger).pipe(
  Layer.provide(builtLayer),
  P.HttpServer.withLogAddress,
  Layer.provide(N.NodeHttpServer.layer(createServer, { port: 8787 })),
);

N.NodeRuntime.runMain(Layer.launch(HttpLive));
```

## Running Locally

```bash
pnpm dev
# Server starts at http://localhost:8787

# Test the endpoint (signature check disabled via env flag)
curl -X POST http://localhost:8787/echo/line \
  -H "Content-Type: application/json" \
  -H "X-Line-Signature: dummy" \
  -d '{"msg": "hello"}'
```

For real LINE webhook traffic, expose the local server with a tunnel (e.g. [ngrok](https://ngrok.com)) and configure the webhook URL in the [LINE Developers Console](https://developers.line.biz/).
