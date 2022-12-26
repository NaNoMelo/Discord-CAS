import { client } from ".."
import { Event } from "../classes/Events"
import { ExtendedInteraction } from "../typings/Command"

export default new Event("interactionCreate", async (interaction) => {
	if (interaction.isCommand()) {
		const command = client.commands.get(interaction.commandName)
		if (!command) return interaction.followUp("Command doesn't exist")

		try {
			command.run(
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
				interaction
			)
		} catch (error) {
			console.error(error)
		}
	}
})
