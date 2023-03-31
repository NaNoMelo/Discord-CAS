import { client } from ".."
import { ApplicationCommandData, CommandInteraction } from "discord.js"

const data: ApplicationCommandData = {
    name: "ping",
    description: "replies with pong"
}

async function run(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply()
    interaction.followUp(
        `Pong !\n\tLatency : ${
            Date.now() - interaction.createdTimestamp
        }ms\n\tAPI Latency : ${client.ws.ping}ms\n\tClient : ${
            client.user?.tag
        }`
    )
}

module.exports = { data, run }
