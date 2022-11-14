import {
	CommandInteractionOptionResolver,
	CommandInteractionOption
} from "discord.js"
import { ExtendedInteraction } from "../typings/Command"
import { ExtendedClient } from "../classes/Client"
import { Profile } from "../classes/Profile"
import fs from "fs"

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
		let mailArg = arg.data.find((data: CommandInteractionOption) => {
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
		let user = await Profile.get(interaction.user.id)
		if (!user) {
			user = new Profile(mailArg.value.toString(), interaction.user.id)
		}
		if (user.authed) {
			interaction.followUp("Vous avez déjà été authentifié")
			return
		}
		user.sendAuthMail()

		user.save()
		interaction.followUp("Un mail d'authentification vous a été envoyé")
	}
}
