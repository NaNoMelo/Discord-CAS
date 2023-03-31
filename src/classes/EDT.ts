import { UV } from "./UV"

export class EDT {
    private static readonly reg =
    /(?<UV>[A-Z0-9]{4})\s+(?<letter>[A-Z]+)?\s*(?<type>[A-Z]{2})\s+(?<group>[0-9]+)\s+(?<day>[a-z]+)\s+(?<startHour>[0-9]+):(?<startMinute>[0-9]{2})\s+(?<endHour>[0-9]+):(?<endMinute>[0-9]{2})\s+(?<frequence>[0-9])\s+(?<mode>[A-Za-zé]{2,})?\s*(?<room>(?<room1>[A-Z]\s?[A-Za-z0-9]+)(, (?<room2>[A-Z]\s?[A-Za-z0-9]+))?)?/
    
    private matches: RegExpExecArray[]
    private UVs: UV[] = []

    constructor(private readonly raw: string, private readonly userID: string) {
        this.matches = this.raw.trim().split("\n").map((course) => {
            const match = EDT.reg.exec(course)
            if (!match) throw new Error("Invalid EDT")
            return match
        })
        this.setUVs()
    }

    private async setUVs() {
        for (const match of this.matches) {
            const uv = await UV.get(match.groups!.UV)
            if (!uv) continue
            if (this.UVs.find((uv) => uv.id === match.groups!.UV)) continue
            this.UVs.push(uv)
        }
    }
}
