import {
	randomBytes,
	type ScryptOptions,
	scrypt as scryptCallback,
	timingSafeEqual,
} from "node:crypto";

const scrypt = (
	password: string,
	salt: Buffer,
	keyLength: number,
	options: ScryptOptions,
) =>
	new Promise<Buffer>((resolve, reject) => {
		scryptCallback(password, salt, keyLength, options, (error, derivedKey) => {
			if (error) {
				reject(error);
				return;
			}

			resolve(derivedKey);
		});
	});

const VERSION = "scrypt-v1";
const KEY_LENGTH = 64;
const COST = 16384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;
const MAXMEM = 64 * 1024 * 1024;

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

export function validatePassword(password: string) {
	return (
		password.length >= MIN_PASSWORD_LENGTH &&
		password.length <= MAX_PASSWORD_LENGTH
	);
}

export async function hashPassword(password: string) {
	if (!validatePassword(password)) {
		throw new Error("Invalid password length");
	}

	const salt = randomBytes(16);
	const hash = await scrypt(password, salt, KEY_LENGTH, {
		N: COST,
		r: BLOCK_SIZE,
		p: PARALLELIZATION,
		maxmem: MAXMEM,
	});

	return [
		VERSION,
		COST.toString(),
		BLOCK_SIZE.toString(),
		PARALLELIZATION.toString(),
		KEY_LENGTH.toString(),
		salt.toString("base64url"),
		hash.toString("base64url"),
	].join("$");
}

export async function verifyPassword(
	password: string,
	storedHash: string | null,
) {
	if (!storedHash) return false;

	const [version, cost, blockSize, parallelization, keyLength, salt, hash] =
		storedHash.split("$");

	if (
		version !== VERSION ||
		!cost ||
		!blockSize ||
		!parallelization ||
		!keyLength ||
		!salt ||
		!hash
	) {
		return false;
	}

	const parsedCost = Number.parseInt(cost, 10);
	const parsedBlockSize = Number.parseInt(blockSize, 10);
	const parsedParallelization = Number.parseInt(parallelization, 10);
	const parsedKeyLength = Number.parseInt(keyLength, 10);

	if (
		!Number.isSafeInteger(parsedCost) ||
		!Number.isSafeInteger(parsedBlockSize) ||
		!Number.isSafeInteger(parsedParallelization) ||
		!Number.isSafeInteger(parsedKeyLength)
	) {
		return false;
	}

	const expected = Buffer.from(hash, "base64url");
	const actual = await scrypt(
		password,
		Buffer.from(salt, "base64url"),
		parsedKeyLength,
		{
			N: parsedCost,
			r: parsedBlockSize,
			p: parsedParallelization,
			maxmem: MAXMEM,
		},
	);

	if (actual.length !== expected.length) return false;

	return timingSafeEqual(actual, expected);
}
