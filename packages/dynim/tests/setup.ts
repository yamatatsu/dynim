import { expect } from "vitest";

expect.extend({
	asPlainTime: (received, expected) => {
		return {
			message: () => `expected ${received} to be ${expected}`,
			pass: received.toString() === expected,
		};
	},
	asZonedDateTime: (received, expected) => {
		return {
			message: () => `expected ${received} to be ${expected}`,
			pass: received.toString({ smallestUnit: "millisecond" }) === expected,
		};
	},
});
