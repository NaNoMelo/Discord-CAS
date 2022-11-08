import { CommandInteractionOptionResolver, Interaction } from "discord.js"
import { ExtendedInteraction } from "../typings/Command"
import { ExtendedClient } from "../classes/Client"
const nodemailer = require("nodemailer")
import { mailer } from ".."

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

module.exports = {
	data: {
		name: "mail",
		description: "sends a test mail "
	},
	async run(
		_arg: CommandInteractionOptionResolver,
		_client: ExtendedClient,
		interaction: ExtendedInteraction
	) {
		let info = await mailer.sendMail(
			new Mail("nathan.lamey@outlook.fr", "123456")
		)
		console.log(info)
		interaction.followUp("mail sent !")
		//console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
	}
}
