import { ApplicationCommandData } from "discord.js"
import { ExtendedInteraction } from "../typings/Command"
import { mailer } from "../classes/Mail"
import { Mail } from "../classes/Mail"
import { SendMailOptions } from "nodemailer"

const data: ApplicationCommandData = {
	name: "mail",
	description: "sends a test mail "
}

async function run(interaction: ExtendedInteraction) {
	await interaction.deferReply()
	let info = await mailer.sendMail(
		new Mail("nathan.lamey@outlook.fr", "123456") as SendMailOptions
	)
	console.log(info)
	interaction.followUp("mail sent !")
}

module.exports = { data, run }
