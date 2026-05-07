import * as Schema from "effect/Schema";
import { FlexMessage } from "./flex-message";
import { ImageMessage } from "./image-message";
import { TextMessage } from "./text-message";

export const AnyLineMessage = Schema.Union(
  FlexMessage,
  ImageMessage,
  TextMessage,
);

export type AnyLineMessage = typeof AnyLineMessage.Type;

export * from "./flex-message";
export * from "./image-message";
export * from "./text-message";
