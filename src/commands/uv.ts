import { ApplicationCommandData } from "discord.js"
import { ExtendedInteraction } from "../typings/Command"
import { PrismaClient } from "@prisma/client"
import { Lang } from "../classes/Locale"
const prisma = new PrismaClient()

const data: ApplicationCommandData = {
	name: "uv",
	description: "Allows managing the UVs",
	options: [
		{
			name: "add",
			description: "Add an UV",
			type: "SUB_COMMAND",
			options: [
				{
					name: "name",
					description: "Name of the UV",
					type: "STRING",
					required: true
				},
				{
					name: "code",
					description: "Code of the UV",
					type: "STRING",
					required: true
				}
			]
		},
        {
            name: "remove",
            description: "Remove an UV",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "code",
                    description: "Code of the UV",
                    type: "STRING",
                    required: true
                }
            ]
        }
	],
	dmPermission: true
}

async function run(interaction: ExtendedInteraction) {
	await interaction.deferReply()
    let code, name
	switch (interaction.options.getSubcommand()) {
		case "add":
			name = interaction.options.getString("name", true)
			code = interaction.options.getString("code", true)
			if (code.match(/^[A-Z]{2}[0-9A-Z]{2}$/)) {
				if (await prisma.uV.findUnique({ where: { id: code } })) {
					interaction.followUp(
						Lang.get("uv.add.alreadyAdded", "fr", { uv: code })
					)
				} else {
					await prisma.uV.create({
						data: {
							id: code,
							name: name
						}
					})
					interaction.followUp(
						Lang.get("uv.add.success", "fr", { uv: code })
					)
				}
			} else {
				interaction.followUp(Lang.get("uv.error.code", "fr"))
			}
            break

        case "remove":
            code = interaction.options.getString("code", true)
            if (code.match(/^[A-Z]{2}[0-9A-Z]{2}$/)) {
                if (await prisma.uV.findUnique({ where: { id: code } })) {
                    await prisma.uV.delete({ where: { id: code } })
                    interaction.followUp(
                        Lang.get("uv.remove.success", "fr", { uv: code })
                    )
                } else {
                    interaction.followUp(
                        Lang.get("uv.remove.notFound", "fr", { uv: code })
                    )
                }
            } else {
                interaction.followUp(Lang.get("uv.error.code", "fr"))
            }
            break
        
	}
}

module.exports = { data, run }
