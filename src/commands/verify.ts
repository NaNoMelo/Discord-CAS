import { ApplicationCommandData } from "discord.js"
import { Lang } from "../classes/Locale"
import { Profile } from "../classes/Profile"
import { Settings } from "../classes/Settings"
import { ExtendedInteraction } from "../typings/Command"

const data: ApplicationCommandData = {
	name: "verify",
	description: "Confirme l'authentification avec le code envoyé précédemment",
	options: [
		{
			name: "code",
			description: "Saisir le code qui vous a été envoyé par mail",
			type: "STRING",
			required: true
		}
	]
}

async function run(interaction: ExtendedInteraction) {
	await interaction.deferReply()
	let user = await Profile.get(interaction.user.id)
	let settings = await Settings.get(interaction.guildId!)

	if (!user) {
		interaction.followUp(Lang.get("cas.auth.notStarted", Lang.defaultLang))
		return
	}
	if (!user.authCode) {
		interaction.followUp(Lang.get("cas.auth.noCode", Lang.defaultLang))
		return
	}
	if (user.authCode == interaction.options.getString("code", true)) {
		user.authed = true
		if (interaction.guild) {
			let role = interaction.guild.roles.cache.find(
				(r) => r.id == settings.verifiedRole
			)
			if (role) interaction.member.roles.add(role)
			if (settings.nicknameFormat) {
				interaction.member.setNickname(settings.nicknameFormat(user))
			}
		}
		await user.save()
		interaction.followUp(Lang.get("cas.auth.success", Lang.defaultLang))
	} else {
		interaction.followUp(Lang.get("cas.auth.invalidCode", Lang.defaultLang))
	}
}

module.exports = { data, run }
