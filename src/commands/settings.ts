import { ApplicationCommandData, CommandInteraction, Role } from "discord.js"
import { Lang } from "../classes/Locale"
import { Profile } from "../classes/Profile"
import { Settings } from "../classes/Settings"
import { UserRoleManager } from "../classes/UserRoleManager"
import { UV } from "../classes/UV"

const data: ApplicationCommandData = {
    name: "settings",
    description: "Permet de modifier les paramètres du bot",
    options: [
        {
            name: "verified-role",
            description:
                "Modifier le rôle à attribuer aux personnes authentifiées",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "role",
                    description:
                        "Rôle à distribuer aux personnes authentifiées",
                    type: "ROLE",
                    required: true
                }
            ]
        },
        {
            name: "promo-role",
            description:
                "Modifier le rôle à attribuer aux personnes d'une promo",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "promo",
                    description: "Promotion à laquelle attribuer le rôle",
                    type: "NUMBER",
                    required: true
                },
                {
                    name: "role",
                    description: "Rôle à attribuer aux personnes de la promo",
                    type: "ROLE",
                    required: true
                }
            ]
        },
        {
            name: "uv-role",
            description: "Modifier le rôle à attribuer aux personnes d'une UV",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "uv",
                    description: "UV à laquelle attribuer le rôle",
                    type: "STRING",
                    required: true
                },
                {
                    name: "role",
                    description: "Rôle à attribuer aux personnes de l'UV",
                    type: "ROLE",
                    required: true
                }
            ]
        },
        {
            name: "nickname",
            description:
                "Modifier le format du pseudo des personnes authentifiées",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "format",
                    description: "Format du pseudo des personnes authentifiées",
                    type: "STRING",
                    required: true
                }
            ]
        },
        {
            name: "apply-roles",
            description:
                "Applique le role vérifié ainsi que les roles de promo et d'UVs aux membres du serveur",
            type: "SUB_COMMAND"
        }
    ],
    dmPermission: false
}

async function run(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply()

    if (!interaction.inGuild()) {
        interaction.followUp(Lang.get("error.notInGuild", Lang.defaultLang))
        return
    }
    const user: Profile | void = await Profile.get(interaction.user.id).catch(
        () => {
            interaction.followUp(Lang.get("error.notAuthed", Lang.defaultLang))
        }
    )
    if (!user) return

    if (
        !(
            await interaction.guild?.members.fetch(interaction.user.id)
        )?.permissions.has("ADMINISTRATOR")
    ) {
        interaction.followUp(Lang.get("error.permission", Lang.defaultLang))
        return
    }

    const settings: Settings = await Settings.get(interaction.guildId).catch(
        () => Settings.create(interaction.guildId)
    )
    let role: Role | null | undefined
    switch (interaction.options.getSubcommand()) {
        case "verified-role":
            role = await interaction.guild?.roles.fetch(
                interaction.options.getRole("role", true).id
            )
            if (!role) return
            settings.verifiedRole = role.id
            interaction.followUp(
                Lang.get("settings.role.verified", Lang.defaultLang, {
                    role: role.toString()
                })
            )
            break

        case "promo-role":
            const promo = interaction.options.getNumber("promo", true)
            role = await interaction.guild?.roles.fetch(
                interaction.options.getRole("role", true).id
            )
            if (!role) return
            await settings.addPromoRole(role.id, promo)
            interaction.followUp(
                Lang.get("settings.role.promo", Lang.defaultLang, {
                    role: role.toString(),
                    promo: promo
                })
            )
            break

        case "uv-role":
            const code = interaction.options.getString("uv", true).toUpperCase()
            if (!code.match(UV.regex)) {
                interaction.followUp(Lang.get("uv.error.code", "fr"))
                return
            }
            const uv = await UV.get(code).catch(() => {
                interaction.followUp(Lang.get("uv.error.notFound", "fr"))
                return
            })
            if (!uv) return
            role = await interaction.guild?.roles.fetch(
                interaction.options.getRole("role", true).id
            )
            if (!role) return
            await settings.addUvRole(role.id, uv.id)
            interaction.followUp(
                Lang.get("settings.role.uv", Lang.defaultLang, {
                    role: role.toString(),
                    uv: uv.id
                })
            )
            break

        case "nickname":
            const format = interaction.options.getString("format", true)
            settings.nicknameFormat = format
            interaction.followUp(
                Lang.get("settings.format.set", Lang.defaultLang, {
                    format: format,
                    example: user.getDiscordNick(settings.nicknameFormat)
                })
            )
            break

        case "apply-roles":
            const userRoleManager = new UserRoleManager(settings.guildID)
            const promises: Promise<void>[] = []
            promises.push(userRoleManager.applyVerifiedRole())
            promises.push(userRoleManager.applyPromoRoles())
            promises.push(userRoleManager.applyUVRoles())
            Promise.all(promises)
                .then(() => {
                    interaction.followUp(
                        Lang.get("settings.roles.applied", Lang.defaultLang)
                    )
                })
                .catch(() => {
                    interaction.followUp(
                        Lang.get("settings.roles.error", Lang.defaultLang)
                    )
                })
            break
    }

    await settings.save()
}

module.exports = { data, run }
