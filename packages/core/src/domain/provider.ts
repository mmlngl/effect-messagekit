import * as Schema from "effect/Schema";

export const ProviderIdentifier = Schema.Literal("LINE", "WHATSAPP").pipe(
  Schema.brand("ProviderIdentifier"),
  Schema.annotations({
    title: "Provider Identifier",
    description: "Unique identifier for a provider",
  }),
);

export type ProviderIdentifierType = typeof ProviderIdentifier.Type;
