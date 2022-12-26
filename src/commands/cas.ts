import { ExtendedInteraction } from "../typings/Command"
import { Profile } from "../classes/Profile"
import { ApplicationCommandData } from "discord.js"
import { Settings } from "../classes/Settings"
import { Lang } from "../classes/Locale"

const data: ApplicationCommandData = {
	name: "cas",
	description: "Commence l'authentification",
	options: [
		{
			name: "mail",
			description: "Saisir votre mail UTBM",
			type: "STRING",
			required: true
		}
	]
}

async function run(interaction: ExtendedInteraction) {
	await interaction.deferReply()
	let user = await Profile.get(interaction.user.id)
	let settings = await Settings.get(interaction.guildId!)
	if (
		!interaction.options
			.getString("mail", true)
			.match(/^[a-zA-Z-]+\.[a-zA-Z-]+\d?@utbm\.fr$/)
	) {
		interaction.followUp(
			Lang.get("cas.invalidMail", Lang.defaultLang, {
				schoolName: "UTBM"
			})
		)
		return 1
	}
	if (!user) {
		user = new Profile(
			interaction.options.getString("mail", true),
			interaction.user.id
		)
	}
	if (user.authed) {
		interaction.followUp(Lang.get("cas.alreadyAuthed", Lang.defaultLang))
		await user.save()
		return
	}
	user.sendAuthMail()

	await user.save()
	interaction.followUp(Lang.get("cas.mailSent", Lang.defaultLang))
}

module.exports = { data, run }
