import { ApplicationCommandData } from "discord.js"
import { ExtendedInteraction } from "../typings/Command"
import { PrismaClient } from "@prisma/client"
import { Lang } from "../classes/Locale"
import { Profile } from "../classes/Profile"
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
        },
        {
            name: "list",
            description: "List all the UVs",
            type: "SUB_COMMAND"
        },
        {
            name: "members",
            description: "List all the members of an UV",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "code",
                    description: "Code of the UV",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            name: "join",
            description: "Joins an UV",
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
    const user = await Profile.get(interaction.user.id).catch(() => {
        interaction.followUp(Lang.get("error.Authed", "fr"))
    })
    if (!user) return

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

        case "list":
            const uvs = await prisma.uV.findMany()
            if (uvs) {
                let text = ""
                for (const uv of uvs) {
                    text += `__**${uv.id}:**__\t${uv.name}\n`
                }
                interaction.followUp(
                    Lang.get("uv.list.list", "fr", { list: text })
                )
            } else {
                interaction.followUp(Lang.get("uv.list.empty", "fr"))
            }
            break

        case "members":
            code = interaction.options.getString("code", true)
            if (code.match(/^[A-Z]{2}[0-9A-Z]{2}$/)) {
                const members = await prisma.uV.findUnique({
                    where: { id: code },
                    include: { members: true }
                })
                if (members) {
                    let text = ""
                    for (const member of members.members) {
                        text += `${member.firstName} ${member.lastName} ${
                            member.nickname
                                ? "*(aka: " + member.nickname + ")*"
                                : ""
                        }\n`
                    }
                    interaction.followUp(
                        Lang.get("uv.members.list", "fr", {
                            uv: code,
                            list: text
                        })
                    )
                } else {
                    interaction.followUp(
                        Lang.get("uv.members.empty", "fr", { uv: code })
                    )
                }
            } else {
                interaction.followUp(Lang.get("uv.error.code", "fr"))
            }
            break

        case "join":
            code = interaction.options.getString("code", true)
			user.joinUV(code)
    }
}

module.exports = { data, run }
