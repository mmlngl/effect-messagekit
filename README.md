# Effect MessageKit

Effect-native library for building messaging platform integrations (LINE, WhatsApp, Slack).

## Problem

Building bots for messaging platforms requires repetitive boilerplate:
- Webhook signature validation
- Cryptic API error messages (`{"message": "Bad Request"}`)
- Manual retry logic for rate limits
- No observability/tracing
- Official SDKs use Promises/throws, incompatible with Effect

## Solution

MessageKit wraps platform SDKs with:
- **Tagged errors** via Effect Schema (API errors, rate limits, signature failures)
- **Auto-retry** with configurable exponential backoff
- **Distributed tracing** via Effect Tracer
- **Type-safe Services** for testability
- **Unified interface** across platforms (LINE, WhatsApp, etc.)

## Status

**MVP in progress** - LINE provider first, WhatsApp next.

See [PRD](https://github.com/mmlngl/effect-messagekit/issues/1) for full design.

## Packages

- `@effect-messagekit/core` - Base message types, Handler interface
- `@effect-messagekit/provider-line` - LINE Bot SDK wrapper
- `@effect-messagekit/provider-whatsapp` - WhatsApp (planned)

## Example

```typescript
import { Handler } from "@effect-messagekit/provider-line"
import { Match } from "effect"

const program = Handler.run({
  request: webhookRequest,
  onEvent: (event) => Match.value(event).pipe(
    Match.tag("TextMessage", (msg) =>
      presentMessage({ type: "text", text: `Echo: ${msg.text}` })
    ),
    Match.tag("FollowEvent", () =>
      presentMessage({ type: "text", text: "Thanks for following!" })
    ),
    Match.exhaustive
  )
})
```

## License

MIT
