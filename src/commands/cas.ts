import { ExtendedInteraction } from "../typings/Command"
import { Profile } from "../classes/Profile"
import { ApplicationCommandData } from "discord.js"
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
		return
	}

	const user: Profile = await Profile.get(interaction.user.id).catch(() =>
		Profile.create(
			interaction.user.id,
			interaction.options.getString("mail", true)
		)
	)

	if (user.authed) {
		interaction.followUp(Lang.get("cas.alreadyAuthed", Lang.defaultLang))
		await user.save()
		return
	}

	user.mail = interaction.options.getString("mail", true)

	await user
		.sendAuthMail()
		.then(() =>
			interaction.followUp(Lang.get("cas.mailSent", Lang.defaultLang))
		)
		.catch(() =>
			interaction.followUp(Lang.get("cas.error", Lang.defaultLang))
		)

	await user.save().catch(() => {
		interaction.followUp(Lang.get("cas.error", Lang.defaultLang))
	})
}

module.exports = { data, run }
