import { CommandInteractionOptionResolver, Interaction } from "discord.js"
import { ExtendedInteraction } from "../typings/Command"
import { ExtendedClient } from "../structures/Client"
import { promisify } from "util"
const nodemailer = require("nodemailer")

class Mail {
	constructor(toAdress: string, token: string) {
		this.from = `"Discord CAS" <${process.env.mailUser}>`
		to: toAdress
		subject: "Discord mail authentication"
		text: `hello world ! ${token}`
	}
}

let testAccount = nodemailer.createTestAccount()
export const mailer = nodemailer.createTransport({
	host: "smtp.utbm.fr",
	port: 465,
	secure: true,
	auth: {
		user: testAccount.user,
		pass: testAccount.pass
	}
})

module.exports = {
	data: {
		name: "mail",
		description: "allows E-mail authentication"
	},
	async run(
		arg: CommandInteractionOptionResolver,
		client: ExtendedClient,
		interaction: ExtendedInteraction
	) {
		let info = await mailer.sendMail(
			new Mail("nathan.lamey@outlook.fr", "123456")
		)
		interaction.followUp(`${info}`)
		console.log(info)
	}
}
