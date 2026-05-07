---
sidebar_position: 1
---

# Echo Bot

Complete reference implementation for a LINE webhook bot. Handles incoming messages, validates signatures, and sends replies.

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

`Group.ts` declares the endpoints and attaches the LINE signature middleware:

```typescript
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
  .add(
    P.HttpApiEndpoint.post("console", "/console")
      .addSuccess(Payload)
      .addError(Schema.String),
  )
  .prefix("/echo") {}
```

## Build the Client Layer

`Clients.ts` constructs the LINE and console clients:

```typescript
import * as Console from "@mmlngl/effect-messagekit-provider-console";
import * as Line from "@mmlngl/effect-messagekit-provider-line";
import * as Layer from "effect/Layer";

const LineClientLayer = Line.Client.layer;
const ConsoleClientLayer = Console.Client.layer;

export const ClientsLayer = Layer.mergeAll(LineClientLayer, ConsoleClientLayer);
```

`Line.Client.layer` reads `LINE_CHANNEL_ACCESS_TOKEN` and `LINE_CHANNEL_SECRET` from the environment automatically.

## Write the Handler

`Handlers.ts` contains the business logic. Build a message array and pass it to `client.send()`:

```typescript
import * as P from "@effect/platform";
import * as Console from "@mmlngl/effect-messagekit-provider-console";
import * as Line from "@mmlngl/effect-messagekit-provider-line";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as Api from "./Api";
import { Payload } from "./Group";

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
            Effect.tap(() => Effect.log("message sent")),
          );

          return Payload.make({ msg: payload.msg });
        }),
      ),
);
```

### Signature Validation

`LineWebhookAuthorization` runs before the handler. It reads the `X-Line-Signature` header, validates it against the raw request body using the Channel Secret, and rejects invalid requests with HTTP 401 — no handler code needed.

```
Request arrives
  → LineWebhookAuthorization validates X-Line-Signature
  → Invalid → LineSignatureError (HTTP 401)
  → Valid   → handler proceeds
```

### Sending Messages

`client.send(recipient, messages)` takes a recipient ID and an array of typed message objects. Swap the message type without touching anything else:

```typescript
// Text
Line.Messages.TextMessage.LineTextMessage.make({ type: "text", text: "hello" })

// Flex
Line.Messages.FlexMessage.LineFlexMessage.make({ type: "flex", altText: "Card", contents: { ... } })
```

For local development without a real LINE channel, swap the client layer for the console provider — same `send` call, output goes to stdout:

```typescript
// Swap Layer.provide(Line.Client.layer) → Layer.provide(Console.Client.layer)
// Then in the handler:
Console.Messages.JsonMessage.ConsoleJsonMessage.make({ contents: payload.msg })
```

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

const ApiLayer = P.HttpApiBuilder.api(Api.ServerApi)
  .pipe(Layer.provide([Handlers.EchoGroupHandlers]))
  .pipe(Layer.provide(Clients.ClientsLayer));

const middlewareLayer = Layer.mergeAll(
  Line.Middleware.LineWebhookAuthorization.layer.pipe(
    Layer.provide(Clients.ClientsLayer),
  ),
);

const builtLayer = Layer.provide(ApiLayer, middlewareLayer);

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

# Test the LINE endpoint (with signature check disabled via env flag)
curl -X POST http://localhost:8787/echo/line \
  -H "Content-Type: application/json" \
  -H "X-Line-Signature: dummy" \
  -d '{"msg": "hello"}'

# Test the console endpoint
curl -X POST http://localhost:8787/echo/console \
  -H "Content-Type: application/json" \
  -d '{"msg": "hello"}'
```

For real LINE webhook traffic, expose the local server with a tunnel (e.g. [ngrok](https://ngrok.com)) and configure the webhook URL in the [LINE Developers Console](https://developers.line.biz/).
