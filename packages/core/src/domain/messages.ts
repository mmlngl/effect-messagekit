import * as Schema from "effect/Schema";
import * as Providers from "./provider";

export const MessageIdentifier = Schema.NonEmptyTrimmedString.pipe(
  Schema.brand("MessageIdentifier"),
  Schema.annotations({
    title: "Message Identifier",
    description: "Unique identifier for a Message",
  }),
);

const common = {
  id: MessageIdentifier,
  timestamp: Schema.DateFromString,
};

export class InboundMessage extends Schema.TaggedClass<InboundMessage>(
  "InboundMessage",
)(
  "InboundMessage",
  {
    provider: Providers.ProviderIdentifier.pipe(
      Schema.annotations({
        title: "Provider",
        description: "The provider that received this message",
      }),
    ),
    ...common,
  },
  {
    title: "Inbound Message",
    description: "An Inbound Message",
  },
) {}

export declare namespace InboundMessage {
  export type Type = typeof InboundMessage.Type;
  export type Encoded = Schema.Schema.Encoded<typeof InboundMessage>;
}

export class OutboundMessage extends Schema.TaggedClass<OutboundMessage>(
  "OutboundMessage",
)(
  "OutboundMessage",
  {
    ...common,
    incomingMessageId: MessageIdentifier.pipe(
      Schema.annotations({
        title: "Incoming Message ID",
        description: "The ID of the incoming message",
      }),
    ),
    provider: Providers.ProviderIdentifier.pipe(
      Schema.annotations({
        title: "Provider",
        description: "The provider to send this message",
      }),
    ),
  },
  {
    title: "Outbound Message",
    description: "An Outbound Message",
  },
) {}

export declare namespace OutboundMessage {
  export type Type = typeof OutboundMessage.Type;
  export type Encoded = Schema.Schema.Encoded<typeof OutboundMessage>;
}

export const AnyMessage = Schema.Union(InboundMessage, OutboundMessage);
export type AnyMessage = typeof AnyMessage.Type;
