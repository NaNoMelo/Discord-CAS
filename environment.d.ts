declare global {
	namespace NodeJS {
		interface ProcessEnv {
			botToken: string
			guildId: string
			environement: "dev" | "prod" | "debug"
		}
	}
}

export {}
