import {
	ApplicationCommandDataResolvable,
	Client,
	ClientEvents,
	Collection
} from "discord.js"
import { promisify } from "util"
import glob from "glob"
import { CommandType } from "../typings/Command"
import { Event } from "./Events"
import path from "path"

const globPromise = promisify(glob)

export class ExtendedClient extends Client {
	commands: Collection<string, CommandType>

	constructor() {
		super({ intents: 65535 })
		this.commands = new Collection()
	}

	async start() {
		this.registerCommands()
		this.registerEvents()
		this.login(process.env.botToken)
	}

	async setCommands(
		slashCommands: ApplicationCommandDataResolvable[],
		guildID?: string
	) {
		if (guildID) {
			this.guilds.cache
				.get(guildID)
				?.commands.set(slashCommands)
				.then(() =>
					console.log(`Successfuly registered commands to ${guildID}`)
				)
			console.log(`Registering commands to ${guildID}`)
		} else {
			this.guilds.cache.forEach((guild) => {
				guild.commands.set([])
			})
			this.application?.commands
				.set(slashCommands)
				.then(() =>
					console.log("Successfuly registered global commands")
				)
			console.log("Registering global commands")
		}
	}

	async registerCommands() {
		const slashCommands: ApplicationCommandDataResolvable[] = []
		const commandFiles = await globPromise(
			path
				.join(process.cwd(), "src", "commands", "*{.ts,.js}")
				.split(path.sep)
				.join("/")
		)
		console.log("commandes :", commandFiles)

		for (const file of commandFiles) {
			const command = require(file) as CommandType
			slashCommands.push(command.data)
			this.commands.set(command.data.name, command)
		}

		this.on("ready", () => {
			this.setCommands(slashCommands)
		})
	}

	async registerEvents() {
		const eventFiles = await globPromise(
			path
				.join(process.cwd(), "src", "events", "*{.ts,.js}")
				.split(path.sep)
				.join("/")
		)
		console.log("events :", eventFiles)
		eventFiles.forEach(async (filePath) => {
			const event: Event<keyof ClientEvents> = require(filePath)?.default
			this.on(event.event, event.run)
		})
	}
}
