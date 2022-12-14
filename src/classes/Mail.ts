import { createTransport } from "nodemailer"
import { decrypt } from "./Crypto"

export class Mail {
	from: String
	to: String
	subject: String
	text: String

	constructor(toAdress: String, token: String) {
		this.from = `"Discord CAS" <${process.env.mailUser}>`
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
		user: process.env.mailUser,
		pass: decrypt(process.env.mailPass as string)
	}
})
