import { ApplicationCommandData } from "discord.js"
import { Lang } from "../classes/Locale"
import { Profile } from "../classes/Profile"
import { ExtendedInteraction } from "../typings/Command"

const data: ApplicationCommandData = {
	name: "nickname",
	description: "Change your nickname",
	options: [
		{
			name: "nickname",
			description: "Your new nickname",
			type: "STRING",
			required: true
		}
	]
}

async function run(interaction: ExtendedInteraction) {
	await interaction.deferReply()
	const user = await Profile.get(interaction.user.id)
	if (!user) {
		interaction.followUp(Lang.get("error.notAuthed", Lang.defaultLang))
		return
	}
	const nickname = interaction.options.getString("nickname", true)

	if (nickname.length > 32) {
		interaction.followUp(Lang.get("nickname.tooLong", Lang.defaultLang))
		return
	}
	user.nickname = nickname
	await user.save()
	interaction.followUp(
		Lang.get("nickname.set", Lang.defaultLang, { nickname: nickname })
	)
}

module.exports = { data, run }
