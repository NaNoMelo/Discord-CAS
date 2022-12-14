import { randomInt } from "crypto"
import { mailer } from "../classes/Mail"
import { Mail } from "./Mail"
import fs from "fs"
import { readFile } from "node:fs/promises"
import { SendMailOptions } from "nodemailer"
import { decrypt, encrypt } from "./Crypto"

export class Profile {
	mail: String
	discordID: String
	promo: Number | null
	authCode: String | null
	authCodeCreationDate: number | null
	firstName: String
	lastName: String
	authed: Boolean

	constructor(mail: String, discordID: String) {
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
		this.authed = false
	}

	static async get(userID: String) {
		if (fs.existsSync(`${__dirname}/../data/${userID}.json`)) {
			fs.writeFile(
				`${__dirname}/../data/${userID}`,
				await encrypt(
					await readFile(`${__dirname}/../data/${userID}.json`, {
						encoding: "utf8"
					})
				),
				{ flag: "w+" },
				(err) => {
					if (err) {
						console.log(err)
					}
				}
			)
			fs.rmSync(`${__dirname}/../data/${userID}.json`)
		}

		if (fs.existsSync(`${__dirname}/../data/${userID}`)) {
			let user = JSON.parse(
				decrypt(
					await readFile(`${__dirname}/../data/${userID}`, {
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
			`${__dirname}/../data/${this.discordID}`,
			encrypt(JSON.stringify(this)),
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
}
