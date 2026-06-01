import {
	hashPassword,
	validatePassword,
	verifyPassword,
} from "@cap/database/auth/password";
import { describe, expect, it } from "vitest";

describe("password auth", () => {
	it("validates supported password lengths", () => {
		expect(validatePassword("1234567")).toBe(false);
		expect(validatePassword("12345678")).toBe(true);
		expect(validatePassword("a".repeat(128))).toBe(true);
		expect(validatePassword("a".repeat(129))).toBe(false);
	});

	it("verifies a password against its hash", async () => {
		const hash = await hashPassword("correct-password");

		await expect(verifyPassword("correct-password", hash)).resolves.toBe(true);
		await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
	});

	it("rejects missing and malformed hashes", async () => {
		await expect(verifyPassword("password", null)).resolves.toBe(false);
		await expect(verifyPassword("password", "not-a-hash")).resolves.toBe(false);
	});
});
