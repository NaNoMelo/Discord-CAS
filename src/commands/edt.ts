import { ApplicationCommandData, CommandInteraction } from "discord.js"
import { Lang } from "../classes/Locale"
import { EDT } from "../classes/EDT"

const data: ApplicationCommandData = {
    name: "edt",
    description: "Permet de générer un emploi du temps",
    options: [
        {
            name: "edt",
            description: "Emploi du temps récupéré dans son espace étudiant",
            type: "STRING",
            required: true
        }
    ],
    dmPermission: true
}

async function run(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply()
    const edt = new EDT(
        interaction.options.getString("edt", true),
        interaction.user.id
    )
}

module.exports = { data, run }
