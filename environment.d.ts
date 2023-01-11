import { BinaryLike } from "node:crypto"

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			botToken: string
			guildId: string
			environement?: "dev" | "prod" | "debug" | "docker"
			mailUser: string
			mailPass: string
			encryptPass: string
			encryptSalt: string
			encryptIv: string
		}
	}
}

export {}
