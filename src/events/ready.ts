import { client } from ".."
import { Event } from "../classes/Events"

export default new Event("ready", () => {
	console.log("Bot is online", client.user?.tag)
	console.log(client.application?.commands)
})
