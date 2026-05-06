---
sidebar_position: 2
---

# Quick Start

Get a LINE bot running in under 5 minutes.

## Installation

```bash
# pnpm
pnpm add @effect-messagekit/provider-line effect

# npm
npm install @effect-messagekit/provider-line effect

# yarn
yarn add @effect-messagekit/provider-line effect
```

## LINE Channel Setup

Before coding, obtain credentials from [LINE Developers Console](https://developers.line.biz/):

1. Create a Messaging API channel
2. Get **Channel Secret** (from Basic settings)
3. Issue **Channel Access Token** (from Messaging API settings)

## Minimal Bot

Create `src/main.ts`:

```typescript
import { createServer } from "node:http";
import * as P from "@effect/platform";
import * as N from "@effect/platform-node";
import * as Line from "@effect-messagekit/provider-line";
import * as Layer from "effect/Layer";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";

// Define handler
const handleWebhook = P.HttpApiBuilder.group(
  P.HttpApi.make("MessageKitApi"),
  "webhook",
  (handlers) =>
    handlers.handle("line", ({ request }) =>
      Effect.gen(function* () {
        const body = yield* request.json;
        const events = body.events || [];

        for (const event of events) {
          yield* Match.value(event).pipe(
            Match.when({ type: "message", message: { type: "text" } }, (e) =>
              Effect.gen(function* () {
                const client = yield* Line.Client.LineClient;
                yield* client.replyMessage({
                  replyToken: e.replyToken,
                  messages: [{ type: "text", text: `Echo: ${e.message.text}` }],
                });
              })
            ),
            Match.orElse(() => Effect.void)
          );
        }

        return { status: "ok" };
      })
    )
);

// Configure layers
const lineClientLayer = Line.Client.LineClient.layer.pipe(
  Layer.provide(Line.Config.LineConfig.layerFromEnv)
);

const apiLayer = P.HttpApiBuilder.api(
  P.HttpApi.make("MessageKitApi")
).pipe(
  Layer.provide(handleWebhook),
  Layer.provide(lineClientLayer)
);

const httpLive = P.HttpApiBuilder.serve(P.HttpMiddleware.logger).pipe(
  Layer.provide(apiLayer),
  P.HttpServer.withLogAddress,
  Layer.provide(N.NodeHttpServer.layer(createServer, { port: 8787 }))
);

N.NodeRuntime.runMain(Layer.launch(httpLive));
```

## Environment Variables

Create `.env`:

```bash
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
LINE_CHANNEL_SECRET=your_channel_secret
DANGEROUSLY_SKIP_LINE_SIGNATURE_VERIFICATION=false
```

Load env vars:

```bash
# Install dotenvx
pnpm add @dotenvx/dotenvx

# Run with env
node --env-file=.env src/main.ts
```

## Local Testing

LINE webhooks require public HTTPS URL. Use ngrok or Cloudflare Tunnel:

### Using ngrok

```bash
# Install ngrok: https://ngrok.com/download

# Start bot
node --env-file=.env src/main.ts

# In another terminal, expose port 8787
ngrok http 8787

# Copy HTTPS URL (e.g., https://abc123.ngrok.io)
# Set in LINE Console: Messaging API > Webhook URL
# Format: https://abc123.ngrok.io/webhook/line
```

### Using Cloudflare Tunnel

```bash
# Install cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

# Start bot
node --env-file=.env src/main.ts

# In another terminal
cloudflared tunnel --url http://localhost:8787

# Copy HTTPS URL and set in LINE Console
```

## Verify

1. Add bot as friend in LINE app (scan QR code from LINE Console)
2. Send message to bot
3. Bot should echo back: "Echo: your message"

## Next Steps

Explore the [LINE Cookbook](./line/echo-bot.md) for patterns:
- Error handling and retries
- Testing with mocks
- Multi-handler routing
- Rich messages (buttons, carousels)
