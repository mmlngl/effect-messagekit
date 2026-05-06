import * as ParseResult from "effect/ParseResult";
import * as Schema from "effect/Schema";
import * as Providers from "./provider";
import * as Users from "./user";

export const MessageIdentifier = Schema.UUID.pipe(
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
) {
  static decodeSingle = (input: Omit<InboundMessageEncoded, "_tag">) =>
    Schema.decode(this)({ _tag: "InboundMessage", ...input });
}

export type InboundMessageType = typeof InboundMessage.Type;
export type InboundMessageEncoded = typeof InboundMessage.Encoded;

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
    recipient: Users.UserIdentifier.pipe(
      Schema.annotations({
        title: "Recipient",
        description: "The user that will receive this message",
      }),
    ),
  },
  {
    title: "Outbound Message",
    description: "An Outbound Message",
  },
) {}

export type OutboundMessageType = typeof OutboundMessage.Type;
export type OutboundMessageEncoded = typeof OutboundMessage.Type;

export const AnyOutboundMessage = Schema.Union(OutboundMessage);
export type AnyOutboundMessage = typeof AnyOutboundMessage.Type;

// biome-ignore lint/suspicious/noExplicitAny: fixes inference
export const makeMessageAdapter = <O extends Schema.Schema<any>>(
  to: O,
  decode: (
    messages: ReadonlyArray<OutboundMessageType>,
  ) => ReadonlyArray<typeof to.Type>,
) =>
  Schema.transformOrFail(Schema.Array(OutboundMessage), Schema.Array(to), {
    strict: true,
    decode: (messages) => ParseResult.succeed(decode(messages)),
    encode: (output, _, ast) =>
      ParseResult.fail(
        new ParseResult.Forbidden(ast, output, "Encoding is forbidden."),
      ),
  });
