import { randomInt } from "crypto"
import { mailer } from "../classes/Mail"
import { CasMail } from "./Mail"
import fs from "fs"
import { SendMailOptions } from "nodemailer"
import { Crypto } from "./Crypto"
import { Collection, User } from "discord.js"
import { PrismaClient, Profile as PrismaProfile } from "@prisma/client"
const prisma = new PrismaClient()

export class Profile {
	constructor(private prismaUser: PrismaProfile) {}

	static async get(userID: string): Promise<Profile> {
		return prisma.profile
			.findUnique({
				where: {
					id: userID
				}
			})
			.then((userData) =>
				userData
					? Promise.resolve(new Profile(userData))
					: Promise.reject(new Error("User does not exist"))
			)
	}

	static async create(userID: string, mail: string): Promise<Profile> {
		const user = new Profile(
			await prisma.profile.create({
				data: {
					id: userID,
					mail: mail,
					firstName: mail.slice(0, mail.indexOf(".")).toLowerCase(),
					lastName: mail
						.slice(mail.indexOf(".") + 1, mail.indexOf("@"))
						.toLowerCase()
				}
			})
		)
		return user
	}

	async save() {
		return await prisma.profile.update({
			where: {
				id: this.prismaUser.id
			},
			data: this.prismaUser
		})
	}

	async delete() {
		await prisma.profile.delete({
			where: {
				id: this.prismaUser.id
			}
		})
	}

	//Getters
	get authed(): boolean {
		return this.prismaUser.authed
	}
	get promo(): number | null {
		return this.prismaUser.promo
	}
	get firstName(): string {
		return this.prismaUser.firstName
	}
	get lastName(): string {
		return this.prismaUser.lastName
	}
	get nickname(): string | null {
		return this.prismaUser.nickname
	}
	get authCode(): string | null {
		return this.prismaUser.authCode
	}
	get authCodeCreation(): Date | null {
		return this.prismaUser.authCodeCreation
	}

	//Setters
	set nickname(nickname: string | null) {
		this.prismaUser.nickname = nickname
	}
	set mail(mail: string) {
		if (mail.match(/^[a-zA-Z-]+\.[a-zA-Z-]+\d?@utbm\.fr$/)) {
			this.prismaUser.mail = mail
		} else {
			throw new Error("Invalid mail")
		}
	}
	set authed(authed: boolean) {
		this.prismaUser.authed = authed
	}

	//Methods
	async genAuthCode() {
		let chars = "0123456789"
		this.prismaUser.authCode = ""
		for (let i = 0; i < 6; i++) {
			this.prismaUser.authCode += chars[randomInt(0, chars.length)]
		}
		this.prismaUser.authCodeCreation = new Date()
		await this.save()
		return this.prismaUser.authCode
	}

	async sendAuthMail() {
		return this.genAuthCode().then(
			async (authCode) =>
				await mailer.sendMail(
					new CasMail(this.prismaUser.mail, authCode)
				)
		)
	}

	public getDiscordNick(nicknameFormat: string) {
		let replacements = new Collection<string, string>()
		replacements.set("firstname", this.prismaUser.firstName)
		replacements.set("lastname", this.prismaUser.lastName)
		replacements.set("nickname", this.prismaUser.nickname || "")
		replacements.set("promo", this.prismaUser.promo?.toString() || "")

		return nicknameFormat.replace(
			/{(\w+)}/g,
			(match, placeholder: string) => {
				let replacement = replacements.get(placeholder)
				if (replacement) {
					return replacement
				} else {
					return match
				}
			}
		)
	}
}
