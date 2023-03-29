import { ApplicationCommandData, CommandInteraction, User } from "discord.js"
import { PrismaClient } from "@prisma/client"
import { Lang } from "../classes/Locale"
import { Profile } from "../classes/Profile"
import { UV } from "../classes/UV"
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
            type: "SUB_COMMAND",
            options: [
                {
                    name: "user",
                    description: "member to list the UVs of",
                    type: "USER",
                    required: false
                }
            ]
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
        },
        {
            name: "leave",
            description: "Leaves an UV",
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

async function run(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply()
    const user = await Profile.get(interaction.user.id).catch(() => {
        interaction.followUp(Lang.get("error.Authed", "fr"))
    })
    if (!user) return

    let code: string, name: string, uv: UV | void
    switch (interaction.options.getSubcommand()) {
        case "add":
            if (!user.admin) {
                interaction.followUp(Lang.get("error.permission", "fr"))
                return
            }
            name = interaction.options.getString("name", true)
            code = interaction.options.getString("code", true).toUpperCase()
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
            if (!user.admin) {
                interaction.followUp(Lang.get("error.permission", "fr"))
                return
            }
            code = interaction.options.getString("code", true).toUpperCase()
            if (code.match(/^[A-Z]{2}[0-9A-Z]{2}$/)) {
                if (await prisma.uV.findUnique({ where: { id: code } })) {
                    await prisma.uV.delete({ where: { id: code } })
                    interaction.followUp(
                        Lang.get("uv.remove.success", "fr", { uv: code })
                    )
                } else {
                    interaction.followUp(
                        Lang.get("uv.error.notFound", "fr", { uv: code })
                    )
                }
            } else {
                interaction.followUp(Lang.get("uv.error.code", "fr"))
            }
            break

        case "list":
            let uvs: UV[], memberProfile: Profile | void

            const member = interaction.options.getUser("user", false)
            if (member) {
                memberProfile = await Profile.get(member.id).catch(() => {
                    interaction.followUp(
                        Lang.get("uv.error.notAuthed", "fr", {
                            user: member.username
                        })
                    )
                })
                if (!memberProfile) return
                uvs = await memberProfile.getUVs()
            } else {
                uvs = await prisma.uV
                    .findMany()
                    .then((uvs) => uvs.map((uv) => new UV(uv)))
            }

            if (uvs.length > 0) {
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
            code = interaction.options.getString("code", true).toUpperCase()
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
            code = interaction.options.getString("code", true).toUpperCase()

            uv = await UV.get(code).catch(() => {
                interaction.followUp(
                    Lang.get("uv.error.notFound", "fr", { uv: code })
                )
                return
            })
            if (!uv) return
            await uv
                .addMember(user.id)
                .then(() =>
                    interaction.followUp(
                        Lang.get("uv.join.success", "fr", { uv: code })
                    )
                )

            break
        case "leave":
            code = interaction.options.getString("code", true).toUpperCase()

            uv = await UV.get(code).catch(() => {
                interaction.followUp(
                    Lang.get("uv.error.notFound", "fr", { uv: code })
                )
            })
            if (!uv) return
            await uv
                .removeMember(user.id)
                .then(() =>
                    interaction.followUp(
                        Lang.get("uv.leave.success", "fr", { uv: code })
                    )
                )

            break
    }
}

module.exports = { data, run }
