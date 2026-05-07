import * as Schema from "effect/Schema";
import { LineFlexMessage } from "./flex-message";
import { LineImageMessage } from "./image-message";
import { LineTextMessage } from "./text-message";

export const AnyLineMessage = Schema.Union(
  LineFlexMessage,
  LineImageMessage,
  LineTextMessage,
);

export type AnyLineMessage = typeof AnyLineMessage.Type;

export * as FlexMessage from "./flex-message";
export * as ImageMessage from "./image-message";
export * as TextMessage from "./text-message";
