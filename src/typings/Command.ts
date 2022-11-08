import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CommandInteractionOptionResolver,
	GuildMember,
	PermissionResolvable
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

export type CommandType = {
	userPermissions?: PermissionResolvable[]
	run: RunFunction
} & ChatInputApplicationCommandData
