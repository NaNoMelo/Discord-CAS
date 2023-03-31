import { ApplicationCommandData, CommandInteraction } from "discord.js"
import { Lang } from "../classes/Locale"
import { Profile } from "../classes/Profile"
import { PrismaClient } from "@prisma/client"
import { UserRoleManager } from "../classes/UserRoleManager"
const prisma = new PrismaClient()

const data: ApplicationCommandData = {
    name: "promo",
    description: "Allows managing pormotions",
    options: [
        {
            name: "set",
            description: "Set the promotion of the user",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "promo",
                    description: "Promotion to set",
                    type: "NUMBER",
                    required: true
                }
            ]
        },
        {
            name: "members",
            description: "List the members of the promotion",
            type: "SUB_COMMAND",
            options: [
                {
                    name: "promo",
                    description: "Promotion to list",
                    type: "NUMBER",
                    required: true
                }
            ]
        }
    ]
}

async function run(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply()
    const user = await Profile.get(interaction.user.id).catch(() => {
        interaction.followUp(Lang.get("error.Authed", "fr"))
    })
    if (!user) return
    let promo: number
    switch (interaction.options.getSubcommand()) {
        case "set":
            promo = interaction.options.getNumber("promo", true)
            user.promo = promo
            await user.save()
            if (interaction.inGuild()) {
                new UserRoleManager(interaction.guildId).applyPromoRoles(interaction.guild?.members.cache.get(interaction.user.id))
            }
            interaction.followUp(
                Lang.get("promo.set", "fr", {
                    promo: promo
                })
            )
            break
        case "members":
            promo = interaction.options.getNumber("promo", true)
            interaction.followUp(
                Lang.get("promo.members", Lang.defaultLang, {
                    promo: promo,
                    list: await prisma.profile
                        .findMany({
                            where: {
                                promo: promo
                            }
                        })
                        .then((members) =>
                            members
                                .map(
                                    (member) =>
                                        `\t${
                                            member.firstName
                                                .charAt(0)
                                                .toUpperCase() +
                                            member.firstName.slice(1)
                                        } ${
                                            member.lastName
                                                .charAt(0)
                                                .toUpperCase() +
                                            member.lastName.slice(1)
                                        } ${
                                            member.nickname
                                                ? "*(aka: " +
                                                  member.nickname +
                                                  ")*"
                                                : ""
                                        }`
                                )
                                .join("\n")
                        )
                })
            )
    }
}

module.exports = { data, run }
