import * as Schema from "effect/Schema";
import { JsonMessage } from "./json-message";
import { MarkdownMessage } from "./markdown-message";

export const AnyConsoleMessage = Schema.Union(JsonMessage, MarkdownMessage);

export type AnyConsoleMessage = typeof AnyConsoleMessage.Type;

export * from "./json-message";
export * from "./markdown-message";
