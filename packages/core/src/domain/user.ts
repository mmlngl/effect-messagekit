import * as Schema from "effect/Schema";

export const UserIdentifier = Schema.NonEmptyTrimmedString.pipe(
  Schema.brand("UserIdentifier"),
  Schema.annotations({
    title: "User Identifier",
    description: "Unique identifier for a user",
  }),
);
