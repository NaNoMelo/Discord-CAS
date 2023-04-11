import { createTransport, SendMailOptions } from "nodemailer"
import { Crypto } from "./Crypto"

export class CasMail implements SendMailOptions {
	from: string
	to: string
	subject: string
	text: string

	constructor(toAdress: string, token: string) {
		this.from = `"Discord CAS" <${process.env.mailUser}>`
		this.to = toAdress
		this.subject = "Discord mail authentication"
		this.text = `Votre code d'authentification est : ${token}\nUtilisez la commande /verify avec votre code pour valider votre authentification.\n Ce code est valide pendant 10 minutes.`
	}
}

export const mailer = createTransport({
	host: "smtp.utbm.fr",
	port: 465,
	secure: true,
	auth: {
		user: process.env.mailUser,
		pass: Crypto.decrypt(process.env.mailPass!)
	}
})
