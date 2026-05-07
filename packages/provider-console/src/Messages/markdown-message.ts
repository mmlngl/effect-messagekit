import * as Schema from "effect/Schema";

export const ConsoleMarkdownMessage = Schema.TaggedStruct(
  "ConsoleMarkdownMessage",
  {
    contents: Schema.NonEmptyTrimmedString,
  },
);
export type ConsoleMarkdownMessageType = typeof ConsoleMarkdownMessage.Type;
