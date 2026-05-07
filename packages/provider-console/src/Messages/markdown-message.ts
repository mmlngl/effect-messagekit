import * as Schema from "effect/Schema";

export const MarkdownMessage = Schema.TaggedStruct("ConsoleMarkdownMessage", {
  contents: Schema.NonEmptyTrimmedString,
});
export type MarkdownMessageType = typeof MarkdownMessage.Type;
