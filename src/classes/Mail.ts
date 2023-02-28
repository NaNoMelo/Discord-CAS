import { createTransport } from "nodemailer"
import { Crypto } from "./Crypto"

export class Mail {
	from: string
	to: string
	subject: string
	text: string

	constructor(toAdress: string, token: string) {
		this.from = `"Discord CAS" <${process.env.mailUser}>`
		this.to = toAdress
		this.subject = "Discord mail authentication"
		this.text = `hello world ! ${token}`
	}
}

export const mailer = createTransport({
	host: "smtp.utbm.fr",
	port: 465,
	secure: true,
	auth: {
		user: process.env.mailUser,
		pass: Crypto.decrypt(process.env.mailPass!)
	}
})
