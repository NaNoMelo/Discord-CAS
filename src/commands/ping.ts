import { CommandInteractionOptionResolver, Interaction } from "discord.js"
import { ExtendedInteraction } from "../typings/Command"
import { ExtendedClient } from "../classes/Client"

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
		await interaction.deferReply()
		interaction.followUp("pong")
	}
}
