import { PrismaClient, UV as PrismaUV } from "@prisma/client"
const prisma = new PrismaClient()

export class UV {
    static regex = /^[A-Z]{2}[0-9A-Z]{1,2}$/
    constructor(private prismaUV: PrismaUV) {}

    static async get(uvName: string): Promise<UV> {
        return prisma.uV
            .findUnique({
                where: {
                    id: uvName
                }
            })
            .then((uvData) =>
                uvData
                    ? Promise.resolve(new UV(uvData))
                    : Promise.reject(new Error("UV does not exist"))
            )
    }

    static async create(uvId: string, uvName: string): Promise<UV> {
        return new UV(
            await prisma.uV.create({
                data: {
                    id: uvId,
                    name: uvName
                }
            })
        )
    }

    async save() {
        return await prisma.uV.update({
            where: {
                id: this.prismaUV.id
            },
            data: this.prismaUV
        })
    }

    async delete() {
        await prisma.uV.delete({
            where: {
                id: this.prismaUV.id
            }
        })
    }

    //Getters
    get id(): string {
        return this.prismaUV.id
    }
    get name(): string {
        return this.prismaUV.name
    }

    //Setters

    //Methods
    async addMember(userID: string) {
        return prisma.uV.update({
            where: {
                id: this.prismaUV.id
            },
            data: {
                members: { connect: { id: userID } }
            }
        })
    }

    async removeMember(userID: string) {
        return prisma.uV.update({
            where: {
                id: this.prismaUV.id
            },
            data: {
                members: { disconnect: { id: userID } }
            }
        })
    }

    async getMembers() {
        return prisma.profile.findMany({
            where: {
                uvs: {
                    some: {
                        id: this.prismaUV.id
                    }
                }
            }
        })
    }
}
