import {
	ApplicationCommandDataResolvable,
	CommandInteractionOptionResolver
} from "discord.js"
import { ExtendedClient } from "../classes/Client"
import { Settings } from "../classes/Settings"
import { ExtendedInteraction } from "../typings/Command"

const data: ApplicationCommandDataResolvable = {
	name: "settings",
	description: "Permet de modifier les paramètres du bot",
	options: [
		{
			name: "role",
			description: "Option que vous shouaitez paramètrer",
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
			let role = arg.getRole("role", true)
			settings.verifiedRole = role.id
			interaction.followUp(
				`Le rôle ${role.toString()} sera à présent utilisé pour les personnes authentifiées sur ce serveur !`
			)
	}

	await settings.save()
}

module.exports = {
	data,
	run
}
