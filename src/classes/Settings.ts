import fs from "fs"
import { readFile } from "node:fs/promises"

export class Settings {
	guildID: String
	verifiedRole: String

	constructor(guildID: String) {
		this.guildID = guildID
		this.verifiedRole = ""
	}

	static async get(guildID: String | null) {
		if (fs.existsSync(`${__dirname}/../configs/${guildID}.json`)) {
			let settings = JSON.parse(
				await readFile(`${__dirname}/../configs/${guildID}.json`, {
					encoding: "utf8"
				})
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
