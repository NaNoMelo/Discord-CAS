import {
	ApplicationCommand,
	CommandInteraction,
	CommandInteractionOptionResolver,
	Interaction
} from "discord.js"
import { client } from ".."
import { Command } from "../structures/Command"
import { Event } from "../structures/Events"
import { ExtendedInteraction } from "../typings/Command"
import { ExtendedClient } from "../structures/Client"

export default new Event("interactionCreate", async (interaction) => {
	if (interaction.isCommand()) {
		await interaction.deferReply()
		const command = client.commands.get(interaction.commandName)
		if (!command) return interaction.followUp("Command doesn't exist")

		command.run(
			interaction.options as CommandInteractionOptionResolver,
			client as ExtendedClient,
			interaction as ExtendedInteraction
		)
	}
})
