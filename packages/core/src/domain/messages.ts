import * as Schema from "effect/Schema";
import * as Users from "./user";

export const MessageIdentifier = Schema.UUID.pipe(
  Schema.brand("MessageIdentifier"),
  Schema.annotations({
    title: "Message Identifier",
    description: "Unique identifier for a Message",
  }),
);

export type MessageIdentifierType = typeof MessageIdentifier.Type;

const common = {
  id: MessageIdentifier,
  timestamp: Schema.DateFromString,
};

export const buildInboundMessage = <A, I, R>(
  content?: Schema.Schema<A, I, R>,
) =>
  Schema.TaggedStruct("InboundMessage", {
    ...common,
    content: content ?? Schema.String,
    sender: Users.UserIdentifier,
  });

const _UnknownInboundMessage = buildInboundMessage(Schema.Unknown);
export type UnknownInboundMessage = typeof _UnknownInboundMessage.Type;

export const buildOutboundMessage = <A, I, R>(
  content: Schema.Schema<A, I, R>,
) =>
  Schema.TaggedStruct("OutboundMessage", {
    ...common,
    content,
    recipient: Users.UserIdentifier,
  });
