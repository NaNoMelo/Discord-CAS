import { PromoRole, UVRole } from "@prisma/client"
import { Guild, GuildMember, Role } from "discord.js"
import { client } from ".."
import { Profile } from "./Profile"
import { Settings } from "./Settings"

export class UserRoleManager {
    private guild: Guild
    constructor(private guildId: string) {
        const tempguild = client.guilds.cache.get(guildId)
        if (!tempguild) throw new Error("Guild does not exist")
        this.guild = tempguild
    }

    async applyVerifiedRole(member?: GuildMember) {
        const guildSettings = await Settings.get(this.guildId).catch(() => {
            return Promise.reject(new Error("Guild settings not defined"))
        })

        if (!guildSettings.verifiedRole) {
            return Promise.reject(new Error("No verified role set"))
        }

        const role = this.guild.roles.cache.get(guildSettings.verifiedRole)
        if (!role) return Promise.reject(new Error("Verified role not found"))

        let applied = 0,
            removed = 0
        const members = member ? [member] : await this.guild.members.fetch()
        members.forEach(async (member) => {
            const profile = await Profile.get(member.id).catch(() => null)
            if (!profile) return
            if (profile.authed) {
                if (!member.roles.cache.has(role.id))
                    member.roles.add(role).then(() => applied++)
            } else {
                if (member.roles.cache.has(role.id))
                    member.roles.remove(role).then(() => removed++)
            }
        })

        return Promise.resolve({ applied: applied, removed: removed })
    }

    async applyPromoRoles(member?: GuildMember) {
        const guildSettings = await Settings.get(this.guildId).catch(() => {
            return Promise.reject(new Error("Guild settings not defined"))
        })

        const promoRolesData: PromoRole[] = await guildSettings.getPromoRoles()
        if (!promoRolesData)
            return Promise.reject(new Error("No promo roles set"))

        const promoRoles: Map<number, Role> = new Map()
        for (const promoRole of promoRolesData) {
            const role = this.guild.roles.cache.get(promoRole.role)
            if (!role) continue
            promoRoles.set(promoRole.promo, role)
        }

        let applied = 0,
            removed = 0
        const members = member ? [member] : await this.guild.members.fetch()
        members.forEach(async (member) => {
            const profile = await Profile.get(member.id).catch(() => null)
            if (!profile) return
            if (profile.promo) {
                for (const [promo, role] of promoRoles) {
                    if (profile.promo === promo) {
                        if (!member.roles.cache.has(role.id))
                            member.roles.add(role).then(() => applied++)
                    } else {
                        if (member.roles.cache.has(role.id))
                            member.roles.remove(role).then(() => removed++)
                    }
                }
            }
        })

        return Promise.resolve({ applied: applied, removed: removed })
    }

    async applyUVRoles(member?: GuildMember) {
        const guildSettings = await Settings.get(this.guildId).catch(() => {
            return Promise.reject(new Error("Guild settings not defined"))
        })

        const uvRolesData: UVRole[] = await guildSettings.getUVRoles()
        if (!uvRolesData) return Promise.reject(new Error("No UV roles set"))

        const uvRoles: Map<string, Role> = new Map()
        for (const uvRole of uvRolesData) {
            const role = this.guild.roles.cache.get(uvRole.role)
            if (!role) continue
            uvRoles.set(uvRole.uvName, role)
        }

        let applied = 0,
            removed = 0
        const members = member ? [member] : await this.guild.members.fetch()
        members.forEach(async (member) => {
            const profile = await Profile.get(member.id).catch(() => null)
            if (!profile) return
            const uvs = await profile.getUVs()
            for (const [uvName, role] of uvRoles) {
                if (uvs.find((uv) => uv.name === uvName)) {
                    if (!member.roles.cache.has(role.id))
                        member.roles.add(role).then(() => applied++)
                } else {
                    if (member.roles.cache.has(role.id))
                        member.roles.remove(role).then(() => removed++)
                }
            }
        })
        
        return Promise.resolve({ applied: applied, removed: removed })
    }
}
