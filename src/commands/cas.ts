import { CommandInteractionOptionResolver } from "discord.js"
import { ExtendedInteraction } from "../typings/Command"
import { ExtendedClient } from "../classes/Client"
import { Profile } from "../classes/Profile"

module.exports = {
	data: {
		name: "cas",
		description: "Commence l'authentification",
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
		await interaction.deferReply()
		if (
			!arg
				.getString("mail", true)
				.match(/^[a-zA-Z-]+\.[a-zA-Z-]+\d?@utbm\.fr$/)
		) {
			interaction.followUp(
				"L'adresse mail spécifiée n'est pas valide ! Merci de donner votre adresse mail UTBM"
			)
			return 1
		}
		let user = await Profile.get(interaction.user.id)
		if (!user) {
			user = new Profile(arg.getString("mail", true), interaction.user.id)
		}
		if (user.authed) {
			interaction.followUp("Vous avez déjà été authentifié")
			await user.save()
			return
		}
		user.sendAuthMail()

		await user.save()
		interaction.followUp(
			"Un mail d'authentification vous a été envoyé\n*Le code d'authentification expirera dans 5mn*"
		)
	}
}
