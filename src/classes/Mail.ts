import { readFileSync } from "fs"
import { createTransport } from "nodemailer"
import { Crypto } from "./Crypto"

export class Mail {
	from: String
	to: String
	subject: String
	text: String

	constructor(toAdress: String, token: String) {
		this.from = `"Discord CAS" <${
			process.env.environement == "docker"
				? readFileSync("/run/secrets/mailUser").toString()
				: process.env.mailUser
		}>`
		this.to = toAdress
		this.subject = "Discord mail authentication"
		this.text = `hello world ! ${token}`
	}
}

export let mailer = createTransport({
	host: "smtp.utbm.fr",
	port: 465,
	secure: true,
	auth: {
		user:
			process.env.environement == "docker"
				? readFileSync("/run/secrets/mailUser").toString()
				: process.env.mailUser,
		pass: Crypto.decrypt(
			process.env.environement == "docker"
				? readFileSync("/run/secrets/mailPass").toString()
				: process.env.mailPass!
		)
	}
})
