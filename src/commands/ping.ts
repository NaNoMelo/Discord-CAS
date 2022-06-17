import { CommandInteractionOptionResolver, Interaction } from "discord.js"
import { ExtendedInteraction } from "../typings/Command"
import { ExtendedClient } from "../structures/Client"

module.exports = {
	data: {
		name: "ping",
		description: "replies with pong"
	},
	async run(
		_arg: CommandInteractionOptionResolver,
		_client: ExtendedClient,
		interaction: ExtendedInteraction
	) {
		interaction.followUp("pong")
	}
}
