import {
	CommandInteractionOptionResolver,
	Interaction,
	Options,
	CommandInteractionOption
} from "discord.js"
import { ExtendedInteraction } from "../typings/Command"
import { ExtendedClient } from "../classes/Client"
const nodemailer = require("nodemailer")
import { mailer } from ".."
import { randomInt } from "crypto"

class Profile {
	mail: String
	discordID: String
	promo: Number | null
	authCode: String | null
	firstName: String
	lastName: String
	authed: Boolean

	constructor(mail: String, discordID: String) {
		this.mail = mail
		this.discordID = discordID
		this.promo = null
		this.authCode = null
		let splitMail = mail.split(/.@/g)
		this.firstName = splitMail[0]
		this.lastName = splitMail[1]
		this.authed = false
	}

	async genAuthCode() {
		let numbers = "0123456789"
		this.authCode = ""
		for (let i = 0; i < 6; i++) {
			this.authCode += numbers[randomInt(0, 10)]
		}
		setTimeout(() => {
			this.authCode = null
		}, 300000)
	}

	async sendAuthMail() {
		await this.genAuthCode()
		if (this.authCode) {
			let info = await mailer.sendMail(new Mail(this.mail, this.authCode))
			return info
		}
	}
}

class Mail {
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

module.exports = {
	data: {
		name: "cas",
		description: "begins authentication",
		options: [
			{
				name: "mail",
				description: "Saisir votre mail UTBM",
				type: "STRING",
				required: "true"
			}
		]
	},
	async run(
		arg: CommandInteractionOptionResolver,
		_client: ExtendedClient,
		interaction: ExtendedInteraction
	) {
		let mailArg = arg.data.find(function (data: CommandInteractionOption) {
			return data.name == "mail"
		})
		if (!mailArg?.value) {
			interaction.followUp(
				"Une erreur a eu lieu, merci de réessayer ulterieurement.\n *si l'erreur persiste, merci de le signaler à un modérateur*"
			)
			return 1
		}
		if (
			!mailArg.value
				.toString()
				.match(/^[a-zA-Z-]+\.[a-zA-Z-]+\d?@utbm\.fr$/)
		) {
			interaction.followUp(
				"L'adresse mail spécifiée n'est pas valide ! Merci de donner votre adresse mail UTBM"
			)
			return 1
		}
		let user = new Profile(mailArg.value.toString(), interaction.user.id)
		user.sendAuthMail()
		interaction.followUp(":+1:")
	}
}
