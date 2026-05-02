import { Domain } from "@effect-messagekit/core";
import * as Schema from "effect/Schema";
import * as ImageMessage from "./image-message";
import * as TextMessage from "./text-message";

// ***************
// INBOUND
// ***************

// Code here…

// ***************
// OUTBOUND
// ***************

export const AnyLineMessage = Schema.Union(
  TextMessage.LineTextMessage,
  ImageMessage.LineImageMessage,
);
export type AnyLineMessageType = typeof AnyLineMessage.Type;

// ***************
// TRANSFORMATIONS
// ***************

export const OutboundMessageFromLineMessage: Schema.Schema<
  Domain.Messages.OutboundMessageType,
  AnyLineMessageType
> = Schema.transform(AnyLineMessage, Domain.Messages.OutboundMessage, {
  strict: false,
  decode: (message) =>
    Domain.Messages.OutboundMessage.make({
      id: Domain.Messages.MessageIdentifier.make("fake-id"),
      incomingMessageId:
        Domain.Messages.MessageIdentifier.make("fake-incoming-id"),
      provider: Domain.Providers.ProviderIdentifier.make("LINE"),
      timestamp: new Date(),
      recipient: Domain.User.UserIdentifier.make(message.to),
    }),
  encode: (message) =>
    TextMessage.LineTextMessage.make({
      to: message.recipient,
      type: "text",
      text: "FAKE CONTENT",
    }),
});
