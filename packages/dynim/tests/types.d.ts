import type { Assertion, AsymmetricMatchersContaining } from "vitest";

interface CustomMatchers<R = unknown> {
	asPlainTime(time: string): R;
	asZonedDateTime(time: string): R;
}
declare module "vitest" {
	// biome-ignore lint/suspicious/noExplicitAny: Allow any type because it will effect only test code.
	interface Assertion<T = any> extends CustomMatchers<T> {}
	interface AsymmetricMatchersContaining extends CustomMatchers {}
}
