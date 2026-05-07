import * as Schema from "effect/Schema";
import * as JsonMessage from "./json-message";
import * as MarkdownMessage from "./markdown-message";

// ***************
// INBOUND
// ***************

// Code here…

// ***************
// OUTBOUND
// ***************

export const AnyConsoleMessage = Schema.Union(
  JsonMessage.ConsoleJsonMessage,
  MarkdownMessage.ConsoleMarkdownMessage,
);
export type AnyConsoleMessageType = typeof AnyConsoleMessage.Type;
