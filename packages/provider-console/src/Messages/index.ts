import * as Core from "@mmlngl/effect-messagekit-core/domain";
import * as Schema from "effect/Schema";
import { JsonMessage } from "./json-message";
import { MarkdownMessage } from "./markdown-message";

export const AnyConsoleMessage = Schema.Union(JsonMessage, MarkdownMessage);

export type AnyConsoleMessage = typeof AnyConsoleMessage.Type;

export const AnyOutboundConsoleMessage =
  Core.Messages.buildOutboundMessage(AnyConsoleMessage);

export type AnyOutboundConsoleMessageType =
  typeof AnyOutboundConsoleMessage.Type;

export * from "./json-message";
export * from "./markdown-message";
