import { ButtonInteraction } from "discord.js"
import { Event } from "../classes/Events"
import { Lang } from "../classes/Locale"
import { Profile } from "../classes/Profile"

export default new Event("guildMemberAdd", async (member) => {
    // opens a dm channel with the user
    const user = await Profile.get(member.id).catch(() => null)
    if (user) return
    const dm = await member.createDM()
    // sends a message to the user
    await dm
        .send(
            Lang.get("welcome.message", Lang.defaultLang, {
                serverName: member.guild.name,
                schoolName: "UTBM"
            })
        )
        .then(async (msg) => {
            msg.createMessageComponentCollector()
            //await dm.createMessageComponentCollector({componentType: })
        })
})
