import {
	ApplicationCommandDataResolvable,
	CommandInteractionOptionResolver
} from "discord.js"
import { ExtendedClient } from "../classes/Client"
import { Profile } from "../classes/Profile"
import { Settings } from "../classes/Settings"
import { ExtendedInteraction } from "../typings/Command"

const data: ApplicationCommandDataResolvable = {
	name: "settings",
	description: "Permet de modifier les paramètres du bot",
	options: [
		{
			name: "role",
			description:
				"Modifier le rôle à attribuer aux personnes authentifiées",
			type: "SUB_COMMAND",
			options: [
				{
					name: "role",
					description:
						"Rôle à distribuer aux personnes authentifiées",
					type: "ROLE",
					required: true
				}
			]
		},
		{
			name: "nickname",
			description:
				"Modifier le format du pseudo des personnes authentifiées",
			type: "SUB_COMMAND",
			options: [
				{
					name: "format",
					description: "Format du pseudo des personnes authentifiées",
					type: "STRING",
					required: true
				}
			]
		}
	],
	dmPermission: false
}

async function run(
	arg: CommandInteractionOptionResolver,
	_client: ExtendedClient,
	interaction: ExtendedInteraction
) {
	await interaction.deferReply()
	if (!interaction.guildId) {
		interaction.followUp("Merci d'utiliser cette commande sur un serveur !")
		return
	}
	let settings = await Settings.get(interaction.guildId?.toString())
	if (!settings) {
		settings = new Settings(interaction.guildId)
	}

	switch (arg.getSubcommand()) {
		case "role":
			const role = arg.getRole("role", true)
			settings.verifiedRole = role.id
			interaction.followUp(
				`Le rôle ${role.toString()} sera à présent utilisé pour les personnes authentifiées sur ce serveur !`
			)
			break
		case "nickname":
			const format = arg.getString("format", true)
			settings.nicknameFormat = format
			const exampleUser = new Profile("francis.duport@utbm.fr", "")
			exampleUser.nickname = "Table"
			exampleUser.promo = 23
			interaction.followUp(
				`Le format de pseudo des personnes authentifiées sur ce serveur est désormais "${format}" !\nExemple : **${exampleUser.getNickname(
					settings.nicknameFormat
				)}**`
			)
			break
	}

	await settings.save()
}

module.exports = {
	data,
	run
}
