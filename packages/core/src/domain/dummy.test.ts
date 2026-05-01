import { it, expect } from "@effect/vitest";
import { Effect } from "effect";

function divide(a: number, b: number) {
	if (b === 0) return Effect.fail("Cannot divide by zero");
	return Effect.succeed(a / b);
}

it.effect("test success", () =>
	Effect.gen(function* () {
		const result = yield* divide(4, 2);
		expect(result).toBe(2);
	}),
);
