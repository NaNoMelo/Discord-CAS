import { CommandInteractionOptionResolver, Interaction } from "discord.js"
import { ExtendedInteraction } from "../typings/Command"
import { ExtendedClient } from "../classes/Client"
import { mailer } from "../classes/Mail"
import { Mail } from "../classes/Mail"
import { SendMailOptions } from "nodemailer"

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
		await interaction.deferReply()
		let info = await mailer.sendMail(
			new Mail("nathan.lamey@outlook.fr", "123456") as SendMailOptions
		)
		console.log(info)
		interaction.followUp("mail sent !")
	}
}
