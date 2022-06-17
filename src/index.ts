require("dotenv").config()
import { ExtendedClient } from "./structures/Client"
import { glob } from "glob"
import { promisify } from "util"
import { Collection } from "discord.js"

export const client = new ExtendedClient()

client.start()
