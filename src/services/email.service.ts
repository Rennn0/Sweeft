import * as mailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export class Email {
    private transporter: mailer.Transporter<SMTPTransport.SentMessageInfo>;
    constructor() {
        this.transporter = mailer.createTransport({
            service: process.env.SMPT_SERVICE,
            auth: {
                user: process.env.SMPT_USERNAME,
                pass: process.env.SMPT_PASSWORD,
            }
        });
    }

    protected SendEmail(to: string[], subject: string, html: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const mailOptions = {
                from: `Sweeft 🤩<${process.env.SMPT_USERNAME}>`,
                to: to,
                subject: subject,
                html: html,
            };

            this.transporter.sendMail(mailOptions, (err, info) => {
                if (err)
                    reject(false);
                else
                    resolve(true);
            })
        })
    }
}