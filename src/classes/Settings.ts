import fs from "fs"
import { readFile } from "node:fs/promises"

export class Settings {
	guildID: string
	verifiedRole: string
	nicknameFormat?: string

	constructor(guildID: string) {
		this.guildID = guildID
		this.verifiedRole = ""
	}

	static async get(guildID: string) {
		if (guildID == null) guildID = "default"
		if (fs.existsSync(`${process.cwd}/src/data/configs/${guildID}.json`)) {
			let settings = JSON.parse(
				await readFile(
					`${process.cwd}/src/data/configs/${guildID}.json`,
					{
						encoding: "utf8"
					}
				)
			)
			return Object.assign(new Settings(""), settings)
		}
	}

	async save() {
		fs.writeFile(
			`${__dirname}/../configs/${this.guildID}.json`,
			JSON.stringify(this),
			{ flag: "w+" },
			(err) => {
				if (err) {
					console.log(err)
				}
			}
		)
	}
}
