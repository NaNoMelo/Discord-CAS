import { randomInt } from "crypto"
import { mailer } from "../classes/Mail"
import { Mail } from "./Mail"
import fs from "fs"
import { readFile } from "node:fs/promises"
import { SendMailOptions } from "nodemailer"
import { Crypto } from "./Crypto"
import { Collection } from "discord.js"

export class Profile {
	mail: string
	discordID: string
	promo: Number | null | "prof"
	authCode: string | null
	authCodeCreationDate: number | null
	firstName: string
	lastName: string
	nickname: string | null
	authed: Boolean

	constructor(mail: string, discordID: string) {
		this.mail = mail
		this.discordID = discordID
		this.promo = null
		this.authCode = null
		this.authCodeCreationDate = null
		this.firstName = mail.slice(0, mail.indexOf(".")).toLowerCase()
		this.firstName =
			this.firstName.charAt(0).toUpperCase() + this.firstName.slice(1)
		this.lastName = mail
			.slice(mail.indexOf(".") + 1, mail.indexOf("@"))
			.toLowerCase()
		this.lastName =
			this.lastName.charAt(0).toUpperCase() + this.lastName.slice(1)
		this.nickname = null
		this.authed = false
	}

	static async get(userID: String) {
		if (fs.existsSync(`${process.cwd()}/src/data/users/${userID}.json`)) {
			fs.writeFile(
				`${process.cwd()}/src/data/users/${userID}`,
				Crypto.encrypt(
					await readFile(
						`${process.cwd()}/src/data/users/${userID}.json`,
						{
							encoding: "utf8"
						}
					)
				),
				{ flag: "w+" },
				(err) => {
					if (err) {
						console.log(err)
					}
				}
			)
			fs.rmSync(`${process.cwd()}/src/data/users/${userID}.json`)
		}

		if (fs.existsSync(`${process.cwd()}/src/data/users/${userID}`)) {
			let user = JSON.parse(
				Crypto.decrypt(
					await readFile(`${process.cwd()}/src/data/users/${userID}`, {
						encoding: "utf8"
					})
				)
			)
			user = Object.assign(new Profile("", ""), user)
			if (user.authCode && user.authCodeCreationDate) {
				if (Date.now() - user.authCodeCreationDate > 600000) {
					user.authCode = null
					user.authCodeCreationDate = null
				}
			}
			return user
		}
	}

	async save() {
		fs.writeFile(
			`${process.cwd()}/src/data/users/${this.discordID}`,
			Crypto.encrypt(JSON.stringify(this)),
			{ flag: "w+" },
			(err) => {
				if (err) {
					console.log(err)
				}
			}
		)
	}

	async genAuthCode() {
		let chars = "0123456789"
		this.authCode = ""
		for (let i = 0; i < 6; i++) {
			this.authCode += chars[randomInt(0, chars.length)]
		}
		this.authCodeCreationDate = Date.now()
	}

	async sendAuthMail() {
		await this.genAuthCode()
		if (this.authCode) {
			let info = await mailer.sendMail(
				new Mail(this.mail, this.authCode) as SendMailOptions
			)
			return info
		}
	}

	public getNickname(nicknameFormat: string) {
		let replacements = new Collection<string, string>()
		replacements.set("firstname", this.firstName)
		replacements.set("lastname", this.lastName)
		replacements.set("nickname", this.nickname || "")
		replacements.set("promo", this.promo?.toString() || "")
		if (nicknameFormat)
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
