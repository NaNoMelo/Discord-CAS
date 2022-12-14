import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CommandInteractionOptionResolver,
	GuildMember
} from "discord.js"

import { ExtendedClient } from "../classes/Client"

export interface ExtendedInteraction extends CommandInteraction {
	member: GuildMember
}

type RunFunction = (
	args: CommandInteractionOptionResolver,
	client: ExtendedClient,
	interaction: ExtendedInteraction
) => any

export interface CommandType {
	data: ApplicationCommandDataResolvable
	run: RunFunction
}
