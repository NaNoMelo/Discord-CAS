require("dotenv").config()
import { readFileSync } from "fs"
import { createCipheriv, createDecipheriv, scryptSync } from "node:crypto"

export class Crypto {
	private static scrypt() {
		const start = Date.now()
		const key = scryptSync(
			Buffer.from(
				process.env.environement == "docker"
					? readFileSync("/run/secrets/encryptPass").toString()
					: process.env.encryptPass!,
				"utf-8"
			),
			Buffer.from(
				process.env.environement == "docker"
					? readFileSync("/run/secrets/encryptSalt").toString()
					: process.env.encryptSalt!,
				"hex"
			),
			16
		)
		const end = Date.now()
		console.log(`scrypt took ${end - start}ms`)
		return key.toString("hex")
	}

	public static encrypt(text: string) {
		const cipher = createCipheriv(
			"aes-256-cbc",
			Crypto.scrypt(),
			Buffer.from(
				process.env.environement == "docker"
					? readFileSync("/run/secrets/encryptIv").toString()
					: process.env.encryptIv!,
				"hex"
			)
		)
		let encrypted = cipher.update(text, "utf8", "hex")
		encrypted += cipher.final("hex")
		return encrypted
	}

	public static decrypt(encrypted: string) {
		const decipher = createDecipheriv(
			"aes-256-cbc",
			Crypto.scrypt(),
			Buffer.from(
				process.env.environement == "docker"
					? readFileSync("/run/secrets/encryptIv").toString()
					: process.env.encryptIv!,
				"hex"
			)
		)
		let decrypted = decipher.update(encrypted, "hex", "utf8")
		decrypted += decipher.final("utf8")
		return decrypted
	}
}
