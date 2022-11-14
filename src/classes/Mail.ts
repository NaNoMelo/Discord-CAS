export class Mail {
	from: String
	to: String
	subject: String
	text: String

	constructor(toAdress: String, token: String) {
		this.from = `"Discord CAS" <${process.env.mailUser}>`
		this.to = toAdress
		this.subject = "Discord mail authentication"
		this.text = `hello world ! ${token}`
	}
}
