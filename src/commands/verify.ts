import { CommandInteractionOptionResolver } from "discord.js"
import { ExtendedClient } from "../classes/Client"
import { Profile } from "../classes/Profile"
import { Settings } from "../classes/Settings"
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
		await interaction.deferReply()
		let user = await Profile.get(interaction.user.id)
		let settings = await Settings.get(interaction.guildId as string)

		if (!user) {
			interaction.followUp(
				"Merci de commencer l'authentification avec la commande /cas"
			)
			return
		}

		if (user.authCode == arg.getString("code", true)) {
			user.authed = true
			if (interaction.guild) {
				let role = interaction.guild.roles.cache.find(
					(r) => r.id == settings.verifiedRole
				)
				if (role) interaction.member.roles.add(role)
				if (settings.nicknameFormat) {
					interaction.member.setNickname(
						settings.nicknameFormat(user)
					)
				}
			}
			await user.save()
			interaction.followUp("Vous avez bien été authentifié !")
		} else {
			interaction.followUp(
				"Le code saisi ne correspond pas avec celui qui vous a été envoyé."
			)
		}
	}
}
