import fs from "fs"
import { readFile } from "node:fs/promises"

export class Settings {
	guildID: String
	verifiedRole: String
	nicknameFormat: String | null

	constructor(guildID: String) {
		this.guildID = guildID
		this.verifiedRole = ""
		this.nicknameFormat = null
	}

	static async get(guildID: String) {
		if (guildID == null) guildID = "default"
		if (fs.existsSync(`${process.cwd()}/src/data/configs/${guildID}.json`)) {
			let settings = JSON.parse(
				await readFile(`${process.cwd()}/src/data/configs/${guildID}.json`, {
					encoding: "utf8"
				})
			)
			return Object.assign(new Settings(""), settings)
		}
	}

	async save() {
		fs.writeFile(
			`${process.cwd()}/src/data/configs/${this.guildID}.json`,
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
