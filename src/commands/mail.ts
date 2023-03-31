import { ApplicationCommandData, CommandInteraction } from "discord.js"
import { mailer } from "../classes/Mail"
import { CasMail } from "../classes/Mail"
import { SendMailOptions } from "nodemailer"

const data: ApplicationCommandData = {
    name: "mail",
    description: "sends a test mail "
}

async function run(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply()
    let info = await mailer.sendMail(
        new CasMail("nathan.lamey@outlook.fr", "123456") as SendMailOptions
    )
    console.log(info)
    interaction.followUp("mail sent !")
}

module.exports = { data, run }
