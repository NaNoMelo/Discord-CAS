import { PrismaClient, GuildConfig, PromoRole, UVRole } from "@prisma/client"
const prisma = new PrismaClient()

export class Settings {
    constructor(private guildConfig: GuildConfig) {}

    static async get(guildID: string): Promise<Settings> {
        return prisma.guildConfig
            .findUnique({
                where: {
                    id: guildID
                }
            })
            .then((guildData) =>
                guildData
                    ? Promise.resolve(new Settings(guildData))
                    : Promise.reject(new Error("Guild does not exist"))
            )
    }

    static async create(guildID: string): Promise<Settings> {
        return new Settings(
            await prisma.guildConfig.create({
                data: { id: guildID }
            })
        )
    }

    async save() {
        return await prisma.guildConfig.update({
            where: {
                id: this.guildConfig.id
            },
            data: this.guildConfig
        })
    }

    async delete() {
        await prisma.guildConfig.delete({
            where: {
                id: this.guildConfig.id
            }
        })
    }

    //Getters
    get nicknameFormat(): string {
        return this.guildConfig.nicknameFormat
    }
    get verifiedRole(): string | null {
        return this.guildConfig.verifiedRole
    }

    //Setters
    set nicknameFormat(format: string) {
        this.guildConfig.nicknameFormat = format
    }
    set verifiedRole(role: string | null) {
        this.guildConfig.verifiedRole = role
    }

    //Methods
}
