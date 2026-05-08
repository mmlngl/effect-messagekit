import * as P from "@effect/platform";
import type * as Core from "@mmlngl/effect-messagekit-core/domain";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as Option from "effect/Option";
import * as Client from "./Client";
import * as Errors from "./Errors";
import type * as Events from "./Events";
import type * as Messages from "./Messages";

export interface LineWebhookHandlerParams<E = never, R = never> {
  payload: Events.LineWebhookBodyType;
  onEvents: (
    events: ReadonlyArray<Events.WebhookEventType>,
  ) => Effect.Effect<
    ReadonlyArray<Option.Option<Messages.AnyOutboundLineMessageType>>,
    E,
    R
  >;
}

export type LineWebhookHandler<E = never, R = never> = (
  params: LineWebhookHandlerParams<E, R>,
) => Effect.Effect<P.HttpServerResponse.HttpServerResponse, E, R>;

const groupByRecipient = <T extends Messages.AnyOutboundLineMessageType>(
  messages: ReadonlyArray<T>,
) =>
  messages.reduce((map, msg) => {
    const existing = HashMap.get(map, msg.recipient);
    return HashMap.set(
      map,
      msg.recipient,
      Option.match(existing, {
        onNone: () => [msg],
        onSome: (msgs) => [...msgs, msg],
      }),
    );
  }, HashMap.empty<Core.User.UserIdentifierType, Array<T>>());

export const make = <E = never, R = never>({
  payload,
  onEvents,
}: LineWebhookHandlerParams<E, R>) =>
  Effect.gen(function* () {
    const client = yield* Client.LineClient;

    const outboundMessages = yield* onEvents(payload.events).pipe(
      Effect.map((opts) => A.getSomes(opts)),
    );

    const grouped = groupByRecipient(outboundMessages);

    yield* Effect.forEach(
      grouped,
      ([recipient, outboundMessages]) =>
        client
          .send(
            recipient,
            outboundMessages.map((m) => m.content),
          )
          .pipe(Effect.mapError((cause) => new Errors.LineApiError({ cause }))),
      {
        concurrency: "inherit",
        discard: true,
      },
    );

    return P.HttpServerResponse.empty();
  });
