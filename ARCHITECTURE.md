# Effect MessageKit - Architecture

## Package Structure

```
effect-messagekit/
├── packages/
│   ├── core/                    # Platform-agnostic types + interfaces
│   └── provider-line/           # LINE-specific impl
└── examples/
    └── line-echo-bot/           # Reference impl
```

## Core Package (`@effect-messagekit/core`)

### Domain Layer (`src/domain/`)

Base schemas + interfaces. Zero platform deps.

**Files:**

- `provider.ts` - `ProviderIdentifier` literal ("LINE" | "WHATSAPP")
- `user.ts` - `UserIdentifier` branded string
- `messages.ts` - Base message schemas
  - `InboundMessage` - Received from platform
  - `OutboundMessage` - Send to platform
  - `MessageIdentifier` branded string
- `events.ts` - Base event schemas
  - `BaseEvent` - Parent event type
  - `EventId` branded string
- `handler.ts` - Handler service interface
  - `EventHandler<E, R>` - Callback type: `(event) => Effect<Response, E, R>`
  - `Handler` service tag with `run({ request, onEvent })`

**Export:** `Domain` namespace in `packages/core/src/index.ts`

### Application Layer (`src/application/`)

Cross-platform services.

**Files:**

- `verify-service.ts` - Webhook signature verification
  - `WebhookVerificationServiceTrait` interface
  - `WebhookVerificationError` tagged error
  - `make(key)` - Factory for provider-specific tag

**Export:** `Application` namespace in `packages/core/src/index.ts`

## LINE Provider Package (`@effect-messagekit/provider-line`)

### Module Files

**`Config.ts`**
- `LineConfig` service tag
- Loads `CHANNEL_ACCESS_TOKEN` + `CHANNEL_SECRET` via `Config.redacted()`
- No `process.env` usage
- Layer: `LineConfigLive`

**`Errors.ts`**
- `LineApiError` - API failures (status, message, cause)
- `LineRateLimitError` - 429 responses (retryAfter, cause)
- `LineSignatureError` - Signature validation failures
- All extend `Schema.TaggedError`

**`RetryConfig.ts`**
- `LineRetryConfig` service
- Fields: `maxRetries`, `baseDelay`, `maxDelay`, `retryableStatuses`
- Defaults: 5 retries, 100ms base, 10s max, [429, 500, 502, 503, 504]
- Layer: `LineRetryConfigLive` (overridable)

**`Client.ts`**
- `LineClient` service wrapping `@line/bot-sdk.LineBotClient`
- Methods:
  - `presentMessage(msg: OutboundMessage)` - Send message
  - Internal: Converts core schemas → LINE SDK types
- Pattern: `tryPromise → LineApiError → retry → tracer span`
- Deps: `LineConfig`, `LineRetryConfig`
- Layer: `LineClientLive`

**`MessageAdapters.ts`**
- `toLineMessage(msg: OutboundMessage)` - Core → LINE SDK format
- `fromLineMessage(lineMsg)` - LINE SDK → Core `InboundMessage`
- Handles LINE-specific types (Flex, Sticker) as extensions

**`Events.ts`**
- LINE event type definitions extending `BaseEvent`
- Event types: `MessageEvent`, `FollowEvent`, `PostbackEvent`, etc.
- Union type: `LineEvent`

**`Handler.ts`**
- Implements `Core.Domain.Handler`
- `run({ request, onEvent })`:
  1. Validate signature via LINE SDK middleware
  2. Parse body → `LineEvent[]`
  3. `Effect.forEach` (sequential) through events
  4. Call `onEvent(event)` per event
  5. Return 200 on success, fail whole batch if any fails
- Deps: `LineConfig`, `LineClient`
- Layer: `LineHandlerLive`

**`Verify.ts`**
- Implements `Core.Application.Verify` for LINE
- Uses LINE SDK `validateSignature()`
- Tag: Created via `Core.Application.Verify.make("LINE")`
- Layer: `LineVerifyLive`

**`index.ts`**
- Exports all modules as namespaces

## Data Flow

### Inbound (Webhook)

```
LINE Platform
  → POST /webhook (signature header + body)
    → Handler.run({ request, onEvent })
      → Verify signature (Verify.ts)
      → Parse body → LineEvent[]
      → forEach event:
        → Convert LINE event → Core.Domain.BaseEvent
        → onEvent(event) [user code]
          → May call Client.presentMessage()
      → Return Response(200) | fail batch
```

### Outbound (Send Message)

```
User code
  → Client.presentMessage(OutboundMessage)
    → MessageAdapters.toLineMessage()
    → LineBotClient.pushMessage() [wrapped in tryPromise]
      → On error: throw LineApiError
      → Retry via Schedule (if retryable status)
      → Emit tracer span
    → Return Effect<void, LineApiError>
```

## Dependency Graph

```
@effect-messagekit/core
  ↑ (imports)
@effect-messagekit/provider-line
  ├── @line/bot-sdk
  └── effect
```

**Core deps:** `effect` (peer)
**LINE deps:** `@effect-messagekit/core` (workspace), `@line/bot-sdk`, `effect` (peer)

## Implementation Patterns

### Service Pattern
All major components = `Context.Tag` + Layer factory:
```ts
export class Service extends Context.Tag("Service")<Service, Trait>() {
  static buildLayer = () => Layer.effect(Service, make)
}
```

### Error Pattern
Tagged errors with Schema:
```ts
export class FooError extends Schema.TaggedError<FooError>("FooError")(
  "FooError",
  { status: Schema.Number, cause: Schema.Unknown }
) {}
```

### SDK Wrapping Pattern
```ts
Effect.tryPromise({
  try: () => sdkClient.someMethod(),
  catch: (err) => new LineApiError({ status: 500, cause: err })
}).pipe(
  Effect.retry(retrySchedule),
  Effect.withSpan("line.someMethod")
)
```

### Config Pattern
```ts
const token = yield* Config.redacted("CHANNEL_ACCESS_TOKEN")
// Use: Redacted.value(token)
```

### Sequential Processing
```ts
Effect.forEach(events, (event) => onEvent(event), { concurrency: "unbounded" })
// Note: Despite param name, default sequential behavior ensures order
```

## Testing Strategy

### Mock Layers
```ts
const MockLineClient = Layer.succeed(LineClient, {
  presentMessage: () => Effect.void
})
```

### Test Config
```ts
const TestLineConfig = Layer.succeed(LineConfig, {
  accessToken: Redacted.make("test-token"),
  channelSecret: Redacted.make("test-secret")
})
```

## Extension Points

### Adding WhatsApp Provider
1. Create `@effect-messagekit/provider-whatsapp` package
2. Implement `Handler`, `Client`, `Config` services
3. Define `WhatsAppEvent` extending `BaseEvent`
4. Message adapters for WhatsApp ↔ Core schemas
5. Same service/layer pattern as LINE

### Adding Message Types
**Core (cross-platform):**
```ts
// packages/core/src/domain/messages.ts
export class AudioMessage extends Schema.TaggedClass("AudioMessage")(...)
```

**LINE-specific:**
```ts
// packages/provider-line/src/Messages.ts
export class FlexMessage extends InboundMessage.extend(...)
```

## File Organization Rules

- **Domain layer:** No external deps except `effect`, `effect/Schema`
- **Application layer:** Can depend on domain
- **Provider packages:** Can depend on core + platform SDK
- **Examples:** Can depend on any provider package

## Naming Conventions

- **Services:** PascalCase tags (`LineClient`, `Handler`)
- **Layers:** `{Service}Live` suffix (`LineClientLive`)
- **Errors:** `{Platform}{ErrorType}Error` (`LineApiError`)
- **Verbs:** Role-based (`presentMessage` not `sendMessage`)
- **Events:** Platform prefix (`LineMessageEvent`)

## Build Output

Each package builds to `dist/`:
```
dist/
├── index.js       # ESM bundle
└── index.d.ts     # Type definitions
```

Turbo handles monorepo orchestration. Packages publish to npm with `@effect-messagekit/` scope.
