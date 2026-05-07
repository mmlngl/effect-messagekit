---
sidebar_position: 2
---

# Error Handling

Effect MessageKit surfaces LINE errors as typed, tagged values — no thrown exceptions, no stringly-typed catch blocks. This page shows how to catch, discriminate, and recover from each error type.

## Error Types

The `@mmlngl/effect-messagekit-provider-line` package exports three tagged errors:

| Error | `_tag` | HTTP status | When |
|---|---|---|---|
| `LineSignatureError` | `"LineSignatureError"` | 401 | Invalid or missing `X-Line-Signature` |
| `LineRateLimitError` | `"LineRateLimitError"` | 500 | LINE API rate limit exceeded |
| `LineApiError` | `"LineApiError"` | 500 | Any other LINE API failure |

All extend `Schema.TaggedError`, so they carry a `cause` field with the underlying error and integrate with Effect's typed error channel.

```typescript
import * as Line from "@mmlngl/effect-messagekit-provider-line";

// Line.Errors.LineApiError
// Line.Errors.LineRateLimitError
// Line.Errors.LineSignatureError
// Line.Errors.AnyLineError  ← union of all three
```

## Catching a Specific Error

Use `Effect.catchTag` to handle one error type and leave the rest in the error channel:

```typescript
import * as Line from "@mmlngl/effect-messagekit-provider-line";
import * as Effect from "effect/Effect";

const program = client.presentMessages([outboundMessage], presenter).pipe(
  Effect.catchTag("LineApiError", (err) =>
    Effect.gen(function* () {
      yield* Effect.logError(`LINE API failed: ${err.cause}`);
      // Return a fallback or re-raise
      return yield* Effect.fail(err);
    }),
  ),
);
```

## Handling Rate Limit Errors

Rate limit errors deserve specific treatment — back off and retry rather than propagate:

```typescript
import * as Line from "@mmlngl/effect-messagekit-provider-line";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";

const sendWithRateLimitHandling = client
  .presentMessages([outboundMessage], presenter)
  .pipe(
    Effect.catchTag("LineRateLimitError", (err) =>
      Effect.gen(function* () {
        yield* Effect.logWarning(`Rate limited by LINE API: ${err.cause}`);
        // Signal that a retry should be attempted
        return yield* Effect.fail(err);
      }),
    ),
    // Retry only on LineRateLimitError, up to 3 times with exponential backoff
    Effect.retry({
      while: (err) => err._tag === "LineRateLimitError",
      schedule: Schedule.exponential("1 second").pipe(
        Schedule.intersect(Schedule.recurs(3)),
      ),
    }),
  );
```

## Discriminating Multiple Error Types

Use `Match.tag` when you want different behaviour for each error type in one place:

```typescript
import * as Line from "@mmlngl/effect-messagekit-provider-line";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";

const program = client.presentMessages([outboundMessage], presenter).pipe(
  Effect.catchAll((err) =>
    Match.value(err).pipe(
      Match.tag("LineSignatureError", () =>
        // Signature errors are programmer/config errors – log and abort
        Effect.logError("Webhook signature mismatch – check Channel Secret").pipe(
          Effect.andThen(Effect.fail(err)),
        ),
      ),
      Match.tag("LineRateLimitError", () =>
        // Rate limits are transient – log and swallow for graceful degradation
        Effect.logWarning("Rate limited – message dropped").pipe(
          Effect.as([] as const),
        ),
      ),
      Match.tag("LineApiError", () =>
        // General API errors – log with cause detail
        Effect.logError(`LINE API error: ${err.cause}`).pipe(
          Effect.andThen(Effect.fail(err)),
        ),
      ),
      Match.exhaustive,
    ),
  ),
);
```

`Match.exhaustive` ensures a compile error if a new error variant is added to `AnyLineError` without updating the match.

## Retry with Exponential Backoff

Effect's `Schedule` module provides composable retry policies. A production-ready schedule for LINE API calls:

```typescript
import * as Schedule from "effect/Schedule";
import * as Duration from "effect/Duration";

// Retry up to 5 times: 1s, 2s, 4s, 8s, 16s – only on transient errors
const retryPolicy = Schedule.exponential(Duration.seconds(1)).pipe(
  Schedule.intersect(Schedule.recurs(5)),
);

const resilientSend = client
  .presentMessages([outboundMessage], presenter)
  .pipe(
    Effect.retry({
      while: (err) =>
        err._tag === "LineRateLimitError" || err._tag === "LineApiError",
      schedule: retryPolicy,
    }),
  );
```

Add `Schedule.jittered` to spread retries across concurrent requests:

```typescript
const jitteredPolicy = Schedule.exponential(Duration.seconds(1)).pipe(
  Schedule.jittered,
  Schedule.intersect(Schedule.recurs(5)),
);
```

## Graceful Degradation

Catch errors at the boundary and return a safe fallback instead of failing the webhook response. LINE requires a 200 response to acknowledge receipt — failing the HTTP response causes LINE to retry the webhook:

```typescript
import * as P from "@effect/platform";
import * as Line from "@mmlngl/effect-messagekit-provider-line";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";

export const EchoGroupHandlers = P.HttpApiBuilder.group(
  Api.ServerApi,
  "echo",
  (handlers) =>
    handlers.handle("line", ({ request }) =>
      Effect.gen(function* () {
        const body = yield* request.json.pipe(
          Effect.mapError((cause) => cause.toString()),
        );

        // Attempt to send; degrade gracefully on any LINE error
        yield* client
          .presentMessages([outboundMessage], presenter)
          .pipe(
            Effect.catchAll((err) =>
              Match.value(err).pipe(
                Match.tag("LineRateLimitError", () =>
                  // Drop the message but still return 200 to LINE
                  Effect.logWarning("Rate limited – skipping reply"),
                ),
                Match.tag("LineApiError", () =>
                  // Log and continue – don't fail the webhook
                  Effect.logError(`LINE API error: ${err.cause}`),
                ),
                Match.tag("PresentBuildError", () =>
                  Effect.logError(`Presenter failed: ${err.cause}`),
                ),
                Match.exhaustive,
              ),
            ),
          );

        return Payload.make({ msg: "ok" });
      }),
    ),
);
```

## Signature Errors

`LineSignatureError` is raised by the `LineWebhookAuthorization` middleware **before** the handler runs. It maps to HTTP 401 automatically — no handler code needed.

To observe signature failures (e.g. for alerting), add a middleware logger:

```typescript
import * as Line from "@mmlngl/effect-messagekit-provider-line";
import * as Effect from "effect/Effect";

// Signature errors bubble as HTTP 401 – observe via Effect logging/tracing
// rather than catching inside the handler
const middlewareLayer = Line.Middleware.LineWebhookAuthorization.layer.pipe(
  Layer.provide(Clients.clientsLayer),
);
```

If you need to test the handler without a real LINE signature, set the env flag during development only:

```bash
DANGEROUSLY_SKIP_LINE_SIGNATURE_VERIFICATION=true
```

> **Warning:** Never set `DANGEROUSLY_SKIP_LINE_SIGNATURE_VERIFICATION=true` in production. Any caller can then send arbitrary webhook payloads.

## Summary

| Scenario | Tool |
|---|---|
| Handle one error type | `Effect.catchTag("LineApiError", ...)` |
| Discriminate all error types | `Match.tag` + `Match.exhaustive` |
| Retry transient failures | `Effect.retry` + `Schedule.exponential` |
| Spread retries under load | `Schedule.jittered` |
| Keep webhook alive on error | Catch all, log, return 200 |
| Signature validation | Handled by middleware, surfaces as HTTP 401 |
