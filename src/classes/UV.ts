import { PrismaClient, UV as PrismaUV } from "@prisma/client"
const prisma = new PrismaClient()

class UV {
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

    async addUser(userID: string) {
        prisma.uV.update({
            where: {
                id: this.prismaUV.id
            },
            data: {
                members: { connect: { id: userID } }
            }
        })
    }
}
