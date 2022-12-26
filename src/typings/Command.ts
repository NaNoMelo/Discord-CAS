import {
	ApplicationCommandDataResolvable,
	AutocompleteInteraction,
	CommandInteraction,
	GuildMember
} from "discord.js"

export interface ExtendedInteraction extends CommandInteraction {
	member: GuildMember
}

type RunFunction = (interaction: ExtendedInteraction) => any

type AutocompleteFunction = (interaction: AutocompleteInteraction) => any

export interface CommandType {
	data: ApplicationCommandDataResolvable
	run: RunFunction
	autocomplete?: AutocompleteFunction
}
