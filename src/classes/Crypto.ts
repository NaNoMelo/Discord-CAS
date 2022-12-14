require("dotenv").config()
import { createCipheriv, createDecipheriv, scryptSync } from "node:crypto"

function scrypt() {
	const start = Date.now()
	const key = scryptSync(
		Buffer.from(process.env.encryptPass as string, "utf-8"),
		Buffer.from(process.env.encryptSalt as string, "hex"),
		16
	)
	const end = Date.now()
	console.log(`scrypt took ${end - start}ms`)
	return key.toString("hex")
}
const derivedkey = scrypt()
const iv = Buffer.from(process.env.encryptIv as string, "hex")

export function encrypt(text: string) {
	const cipher = createCipheriv("aes-256-cbc", derivedkey, iv)
	let encrypted = cipher.update(text, "utf8", "hex")
	encrypted += cipher.final("hex")
	return encrypted
}

export function decrypt(encrypted: string) {
	const decipher = createDecipheriv("aes-256-cbc", derivedkey, iv)
	let decrypted = decipher.update(encrypted, "hex", "utf8")
	decrypted += decipher.final("utf8")
	return decrypted
}
