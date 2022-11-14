import {
	CommandInteractionOption,
	CommandInteractionOptionResolver
} from "discord.js"
import { ExtendedClient } from "../classes/Client"
import { Profile } from "../classes/Profile"
import { ExtendedInteraction } from "../typings/Command"

module.exports = {
	data: {
		name: "verify",
		description:
			"Confirme l'authentification avec le code envoyé précédemment",
		options: [
			{
				name: "code",
				description: "Saisir le code qui vous a été envoyé par mail",
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
		let codeArg = arg.data.find((data: CommandInteractionOption) => {
			return data.name == "code"
		})
		if (!codeArg?.value) {
			interaction.followUp(
				"Une erreur a eu lieu, merci de réessayer ulterieurement.\n *si l'erreur persiste, merci de le signaler à un modérateur*"
			)
			return 1
		}
		let code = codeArg.value
		let user = await Profile.get(interaction.user.id)
		console.log(user)
		if (!user) {
			interaction.followUp(
				"Merci de commencer l'authentification avec la commande /cas"
			)
			return
		}

		if (user.authCode == code) {
			user.authed = true
			user.save()
			interaction.followUp("Vous avez bien été authentifié !")
		} else {
			interaction.followUp(
				"Le code saisi ne correspond pas avec celui qui vous a été envoyé."
			)
		}
	}
}
