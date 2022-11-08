require("dotenv").config()
const nodemailer = require("nodemailer")
import { createTestAccount } from "nodemailer"
import { ExtendedClient } from "./classes/Client"

export const client = new ExtendedClient()

class Mail {
	from: String
	to: String
	subject: String
	text: string

	constructor(toAdress: string, token: string) {
		this.from = `"Discord CAS" <${process.env.mailUser}>`
		this.to = toAdress
		this.subject = "Discord mail authentication"
		this.text = `hello world ! ${token}`
	}
}

export var mailer = nodemailer.createTransport({
	host: "smtp.utbm.fr",
	port: 465,
	secure: true,
	auth: {
		user: process.env.mailUser,
		pass: process.env.mailPass
	}
})

async function main() {
	

	/*let testAccount = await nodemailer.createTestAccount()
	var mailer = nodemailer.createTransport({
		host: "smtp.ethereal.email",
		port: 587,
		secure: false,
		auth: {
			user: testAccount.user,
			pass: testAccount.pass
		}
	})*/

	async function testMail() {
		let info = await mailer.sendMail(
			new Mail("nathan.lamey@outlook.fr", "123456")
		)
		console.log(info)
		//console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
	}

	//testMail()
}
main().catch(console.error)
client.start()
