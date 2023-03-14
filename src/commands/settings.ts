import { ApplicationCommandData } from "discord.js"
import { Lang } from "../classes/Locale"
import { Profile } from "../classes/Profile"
import { Settings } from "../classes/Settings"
import { ExtendedInteraction } from "../typings/Command"

const data: ApplicationCommandData = {
	name: "settings",
	description: "Permet de modifier les paramètres du bot",
	options: [
		{
			name: "role",
			description:
				"Modifier le rôle à attribuer aux personnes authentifiées",
			type: "SUB_COMMAND",
			options: [
				{
					name: "role",
					description:
						"Rôle à distribuer aux personnes authentifiées",
					type: "ROLE",
					required: true
				}
			]
		},
		{
			name: "nickname",
			description:
				"Modifier le format du pseudo des personnes authentifiées",
			type: "SUB_COMMAND",
			options: [
				{
					name: "format",
					description: "Format du pseudo des personnes authentifiées",
					type: "STRING",
					required: true
				}
			]
		}
	],
	dmPermission: false
}

async function run(interaction: ExtendedInteraction) {
	await interaction.deferReply()

	if (!interaction.inGuild()) {
		interaction.followUp(Lang.get("error.notInGuild", Lang.defaultLang))
		return
	}
	const user: Profile | void = await Profile.get(interaction.user.id).catch(
		() => {
			interaction.followUp(Lang.get("error.notAuthed", Lang.defaultLang))
		}
	)
	if (!user) return

	const settings: Settings = await Settings.get(interaction.guildId).catch(
		() => Settings.create(interaction.guildId)
	)

	if (!user.admin)
		return interaction.followUp(
			Lang.get("error.permission", Lang.defaultLang)
		)

	switch (interaction.options.getSubcommand()) {
		case "role":
			const role = interaction.options.getRole("role", true)
			settings.verifiedRole = role.id
			interaction.followUp(
				Lang.get("settings.role.set", Lang.defaultLang, {
					role: role.toString()
				})
			)
			break
		case "nickname":
			const format = interaction.options.getString("format", true)
			settings.nicknameFormat = format
			interaction.followUp(
				Lang.get("settings.format.set", Lang.defaultLang, {
					format: format,
					example: user.getDiscordNick(
						settings.nicknameFormat
					)
				})
			)
			break

		case "promo":
			const promo = interaction.options.getString("promo", true)
			
	}

	await settings.save()
}

module.exports = { data, run }
