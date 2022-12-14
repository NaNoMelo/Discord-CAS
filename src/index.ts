require("dotenv").config()
import { ExtendedClient } from "./classes/Client"

export const client = new ExtendedClient()

async function main() {}

main().catch(console.error)
client.start()
