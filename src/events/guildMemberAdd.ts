import { Event } from "../classes/Events"
import { Lang } from "../classes/Locale"

export default new Event("guildMemberAdd", async (member) => {
	// opens a dm channel with the user
	const dm = await member.createDM()
	// sends a message to the user
	await dm.send(
		Lang.get("welcome.message", Lang.defaultLang, {
			serverName: member.guild.name
		})
	)
	//await dm.createMessageComponentCollector({componentType: })
})
