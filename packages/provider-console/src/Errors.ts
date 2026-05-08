import * as P from "@effect/platform";
import * as Schema from "effect/Schema";

export class ConsoleApiError extends Schema.TaggedError<ConsoleApiError>(
  "ConsoleApiError",
)(
  "ConsoleApiError",
  {
    cause: Schema.Unknown,
  },
  P.HttpApiSchema.annotations({
    status: 500,
    title: "Console API Error",
    description: "Console returned an error",
  }),
) {}

export const AnyConsoleError = Schema.Union(ConsoleApiError);
export type AnyConsoleError = typeof AnyConsoleError.Type;
