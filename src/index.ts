require("dotenv").config()
import { ExtendedClient } from "./classes/Client"
import { Lang } from "./classes/Locale"

export const client = new ExtendedClient()

async function main() {}
Lang.init()
main().catch(console.error)
client.start()
