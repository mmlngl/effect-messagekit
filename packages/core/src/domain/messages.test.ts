import { expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Mod from "./messages";

it.describe("Inbound", () => {
  it.effect("decodes unknown", () =>
    Effect.gen(function* () {
      const result = yield* Mod.InboundMessage.decodeSingle({
        provider: "LINE",
        id: "msg-1",
        timestamp: new Date().toISOString(),
      }).pipe(Effect.exit);
      expect(Exit.isSuccess(result)).toBeTruthy();
    }),
  );
});

it.describe("Outbound", () => {
  it.effect("decodes unknown", () =>
    Effect.gen(function* () {
      const result = yield* Mod.OutboundMessage.decodeSingle({
        provider: "LINE",
        id: "msg-2",
        timestamp: new Date().toISOString(),
        incomingMessageId: "msg-1",
      }).pipe(Effect.exit);
      expect(Exit.isSuccess(result)).toBeTruthy();
    }),
  );
});
