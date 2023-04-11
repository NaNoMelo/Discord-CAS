import {
    ApplicationCommandData,
    AutocompleteInteraction,
    CommandInteraction
} from "discord.js"
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
                    required: true,
                    autocomplete: true
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
                    required: true,
                    autocomplete: true
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
                    required: true,
                    autocomplete: true
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
                    required: true,
                    autocomplete: true
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
            if (!code.match(UV.regex)) {
                interaction.followUp(Lang.get("uv.error.code", "fr"))
                return
            }
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
            break

        case "remove":
            if (!user.admin) {
                interaction.followUp(Lang.get("error.permission", "fr"))
                return
            }
            code = interaction.options.getString("code", true).toUpperCase()
            if (!code.match(UV.regex)) {
                interaction.followUp(Lang.get("uv.error.code", "fr"))
                return
            }
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
            if (!code.match(UV.regex)) {
                interaction.followUp(Lang.get("uv.error.code", "fr"))
                return
            }
            const members = await prisma.profile.findMany({
                where: { uvs: { some: { id: code } } }
            })
            if (members) {
                let text = ""
                for (const member of members) {
                    text += `\t${member.firstName} ${member.lastName} ${
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
            break

        case "join":
            code = interaction.options.getString("code", true).toUpperCase()
            if (!code.match(UV.regex)) {
                interaction.followUp(Lang.get("uv.error.code", "fr"))
                return
            }
            uv = await UV.get(code).catch(() => {
                interaction.followUp(
                    Lang.get("uv.error.notFound", "fr", { uv: code })
                )
                return
            })
            if (!uv) return
            if ((await user.getUVs()).some((uv) => uv.id === code)) {
                interaction.followUp(
                    Lang.get("uv.join.alreadyJoined", "fr", { uv: code })
                )
                return
            }
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
            if (!code.match(UV.regex)) {
                interaction.followUp(Lang.get("uv.error.code", "fr"))
                return
            }
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

async function autocomplete(
    interaction: AutocompleteInteraction
): Promise<void> {
    switch (interaction.options.getSubcommand()) {
        case "join":
            interaction.respond(
                (
                    await prisma.uV.findMany({
                        where: {
                            members: { none: { id: interaction.user.id } }
                        }
                    })
                )
                    .filter((uv) =>
                        uv.id.startsWith(
                            interaction.options
                                .getString("code", true)
                                .toUpperCase()
                        )
                    )
                    .map((uv) => ({
                        name: `${uv.id} : ${uv.name}`,
                        value: uv.id
                    }))
            )
            break
        case "leave":
            interaction.respond(
                (
                    await prisma.uV.findMany({
                        where: {
                            members: { some: { id: interaction.user.id } }
                        }
                    })
                )
                    .filter((uv) =>
                        uv.id.startsWith(
                            interaction.options
                                .getString("code", true)
                                .toUpperCase()
                        )
                    )
                    .map((uv) => ({
                        name: `${uv.id} : ${uv.name}`,
                        value: uv.id
                    }))
            )
            break
        case "remove":
            console.log("remove")
            interaction.respond(
                (await prisma.uV.findMany())
                    .filter((uv) =>
                        uv.id.startsWith(
                            interaction.options
                                .getString("code", true)
                                .toUpperCase()
                        )
                    )
                    .map((uv) => ({
                        name: `${uv.id} : ${uv.name}`,
                        value: uv.id
                    }))
            )
            break

        case "members":
            interaction.respond(
                (await prisma.uV.findMany())
                    .filter((uv) =>
                        uv.id.startsWith(
                            interaction.options
                                .getString("code", true)
                                .toUpperCase()
                        )
                    )
                    .map((uv) => ({
                        name: `${uv.id} : ${uv.name}`,
                        value: uv.id
                    }))
            )
            break
    }
}

module.exports = { data, run, autocomplete }
