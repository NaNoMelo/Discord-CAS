import { ApplicationCommandData, CommandInteraction } from "discord.js"
import { Lang } from "../classes/Locale"
import { Profile } from "../classes/Profile"
import { Settings } from "../classes/Settings"

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

async function run(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply()

    const user = await Profile.get(interaction.user.id).catch(() => {
        interaction.followUp(Lang.get("cas.auth.notStarted", Lang.defaultLang))
    })
    if (!user) return

    let settings: Settings | null = null
    if (interaction.inGuild()) {
        settings = await Settings.get(interaction.guildId).catch(() => null)
    }

    if (!user.authCodeCreation) {
        interaction.followUp(Lang.get("cas.auth.notStarted", Lang.defaultLang))
        return
    }

    if (Date.now() - user.authCodeCreation.getTime() > 1000 * 60 * 5) {
        interaction.followUp(Lang.get("cas.auth.expired", Lang.defaultLang))
        return
    }

    if (user.authCode === interaction.options.getString("code", true)) {
        user.authed = true

        await user
            .save()
            .then(() => {
                interaction.followUp(
                    Lang.get("cas.auth.success", Lang.defaultLang)
                )
            })
            .catch(() => {
                interaction.followUp(
                    Lang.get("cas.auth.error", Lang.defaultLang)
                )
            })
    } else {
        interaction.followUp(Lang.get("cas.auth.invalidCode", Lang.defaultLang))
    }
}

module.exports = { data, run }
