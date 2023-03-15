import {
    ApplicationCommandDataResolvable,
    AutocompleteInteraction,
    CommandInteraction,
} from "discord.js"

type RunFunction = (interaction: CommandInteraction) => any

type AutocompleteFunction = (interaction: AutocompleteInteraction) => any

export interface CommandType {
    data: ApplicationCommandDataResolvable
    run: RunFunction
    autocomplete?: AutocompleteFunction
}
