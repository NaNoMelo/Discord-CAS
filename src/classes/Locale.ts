import { GlobSync } from "glob"
import path from "path"

type Locale = "en-US" | "en-GB" | "fr"

type LocalizationStrings = {
	[key: string]: string | LocalizationStrings
}

type LocaleStrings = {
	[locale in Locale]?: LocalizationStrings
}

export class Lang {
	public static locales: LocaleStrings = {}

	static init() {
		let localesFiles = new GlobSync(
			path
				.join(process.cwd(), "src", "locales", "*.json")
				.split(path.sep)
				.join("/")
		).found

		for (let localeFile of localesFiles) {
			let locale: LocalizationStrings = require(localeFile)
			let language: Locale = localeFile
				.split("/")
				.pop()!
				.split(".")
				.shift()! as Locale
			Lang.locales[language] = locale
		}
		console.log("Available locales : " + Object.keys(Lang.locales))
	}

	static defaultLang: Locale = "fr"

	public static get(
		key: string,
		language: Locale,
		placeholders: { [parameter: string]: string } = {}
	): string {
		let locale: LocalizationStrings | undefined =
			Lang.locales[language] || Lang.locales[Lang.defaultLang]
		if (!locale) {
			return `missing locale for language '${language}'`
		}
		const keys = key.split(".")
		let value: string | undefined
		try {
			value = keys.reduce((obj: any, key) => obj[key], locale)
		} catch (error:any) {
			console.error(error)
			value = undefined
		}

		if (!value) {
			if (key == "error.lang.missing") {
				value = `missing translation for '{key}' in '{language}'`
			} else {
				return Lang.get("error.lang.missing", language, {
					key: key,
					language: language
				})
			}
		}

		return value.replace(/{(\w+)}/g, (match, placeholder: string) => {
			return placeholders.hasOwnProperty(placeholder)
				? placeholders[placeholder]
				: match
		})
	}
}
