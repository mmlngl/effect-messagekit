import * as Schema from "effect/Schema";

export const QuoteToken = Schema.NonEmptyTrimmedString.pipe(
  Schema.brand("QuoteToken"),
  Schema.annotations({
    title: "Quote Token",
  }),
);

export type QuoteTokenType = typeof QuoteToken.Type;

export const ReplyToken = Schema.NonEmptyTrimmedString.pipe(
  Schema.brand("ReplyToken"),
  Schema.annotations({
    title: "Quote Token",
  }),
);

export type ReplyTokenType = typeof ReplyToken.Type;

export const GroupIdentifier = Schema.NonEmptyTrimmedString.pipe(
  Schema.brand("GroupIdentifier"),
  Schema.annotations({
    title: "Group Identifier",
    description: "Unique identifier for a user",
  }),
);

export type GroupIdentifierType = typeof GroupIdentifier.Type;

export const RoomIdentifier = Schema.NonEmptyTrimmedString.pipe(
  Schema.brand("RoomIdentifier"),
  Schema.annotations({
    title: "Room Identifier",
    description: "Unique identifier for a user",
  }),
);

export type RoomIdentifierType = typeof RoomIdentifier.Type;
