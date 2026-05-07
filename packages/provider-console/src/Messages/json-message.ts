import * as Schema from "effect/Schema";

export const ConsoleJsonMessage = Schema.TaggedStruct("ConsoleJsonMessage", {
  contents: Schema.NonEmptyTrimmedString,
});

export type ConsoleJsonMessageType = typeof ConsoleJsonMessage.Type;
