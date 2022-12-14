import {
	ApplicationCommandDataResolvable,
	AutocompleteInteraction,
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

type AutocompleteFunction = (
	args: CommandInteractionOptionResolver,
	client: ExtendedClient,
	interaction: AutocompleteInteraction
) => any

export interface CommandType {
	data: ApplicationCommandDataResolvable
	run: RunFunction
	autocomplete?: AutocompleteFunction
}
