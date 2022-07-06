require("dotenv").config()
const nodemailer = require("nodemailer")
import { createTestAccount } from "nodemailer"
import { ExtendedClient } from "./structures/Client"

export const client = new ExtendedClient()

/*export const mailer = nodemailer.createTransport({
    host: "smtp.utbm.fr",
    port: 465,
    secure: true,
    auth: {
        user: process.env.mailUser,
        pass: process.env.mailPass
    }
})*/

client.start()
