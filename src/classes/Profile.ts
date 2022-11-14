import { randomInt } from "crypto"
import { mailer } from ".."
import { Mail } from "./Mail"
import fs, { existsSync, fdatasync } from "fs"
import { readFile } from "node:fs/promises"

export class Profile {
	mail: String
	discordID: String
	promo: Number | null
	authCode: String | null
	firstName: String
	lastName: String
	authed: Boolean

	/*constructor(mail: String, discordID: String)
	constructor(user: RawProfile)*/
	constructor(mail: String, discordID: String) {
		this.mail = mail
		this.discordID = discordID
		this.promo = null
		this.authCode = null
		this.firstName = mail.slice(0, mail.indexOf(".")).toLowerCase()
		this.lastName = mail
			.slice(mail.indexOf(".") + 1, mail.indexOf("@"))
			.toLowerCase()
		this.authed = false
	}

	static async get(userID: String) {
		if (fs.existsSync(`${__dirname}/../data/${userID}.json`)) {
			let user = JSON.parse(
				await readFile(`${__dirname}/../data/${userID}.json`, {
					encoding: "utf8"
				})
			)
			return Object.assign(new Profile("", ""), user)
		}
	}

	async save() {
		await fs.writeFile(
			`${__dirname}/../data/${this.discordID}.json`,
			JSON.stringify(this),
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
		setTimeout(async () => {
			let user = await Profile.get(this.discordID)
			user.authCode = null
			user.save()
		}, 300000)
	}

	async sendAuthMail() {
		await this.genAuthCode()
		if (this.authCode) {
			let info = await mailer.sendMail(new Mail(this.mail, this.authCode))
			return info
		}
	}
}
