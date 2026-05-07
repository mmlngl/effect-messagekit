import * as Schema from "effect/Schema";
import { ConsoleJsonMessage } from "./json-message";
import { ConsoleMarkdownMessage } from "./markdown-message";

export const AnyConsoleMessage = Schema.Union(
  ConsoleJsonMessage,
  ConsoleMarkdownMessage,
);

export type AnyConsoleMessage = typeof AnyConsoleMessage.Type;

export * as JsonMessage from "./json-message";
export * as MarkdownMessage from "./markdown-message";
