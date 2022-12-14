import {
	AutocompleteInteraction,
	CommandInteractionOptionResolver
} from "discord.js"
import { client } from ".."
import { Event } from "../classes/Events"
import { ExtendedInteraction } from "../typings/Command"
import { ExtendedClient } from "../classes/Client"

export default new Event("interactionCreate", async (interaction) => {
	if (interaction.isCommand()) {
		const command = client.commands.get(interaction.commandName)
		if (!command) return interaction.followUp("Command doesn't exist")

		try {
			command.run(
				interaction.options as CommandInteractionOptionResolver,
				client as ExtendedClient,
				interaction as ExtendedInteraction
			)
		} catch (error) {
			console.error(error)
		}
	} else if (interaction.isAutocomplete()) {
		const command = client.commands.get(interaction.commandName)
		if (!command) return
		if (!command.autocomplete) return
		try {
			command.autocomplete(
				interaction.options as CommandInteractionOptionResolver,
				client as ExtendedClient,
				interaction as AutocompleteInteraction
			)
		} catch (error) {
			console.error(error)
		}
	}
})
