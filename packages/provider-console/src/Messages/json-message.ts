import * as Schema from "effect/Schema";

export const JsonMessage = Schema.TaggedStruct("ConsoleJsonMessage", {
  contents: Schema.NonEmptyTrimmedString,
});

export type JsonMessageType = typeof JsonMessage.Type;
