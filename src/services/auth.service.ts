import { Email } from "./email.service";
import * as fs from 'fs';
import * as HandleBars from 'handlebars';
import { CompanyRequest } from "../models/CompanyRequest";

export class AuthService extends Email {
    constructor() {
        super();
    }

    public SendActivationEmail(company: CompanyRequest): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            fs.readFile("src\\templates\\activation.email.html", "utf8", (err, template) => {
                if (err)
                    reject(`Error opening file ${err}`);

                const compiledTemplate = HandleBars.compile(template);
                const html = compiledTemplate({ company });

                /**
                 *  axali cxrili linkebis gasaaqtiureblad, ifiqre mere 
                 */

                this.SendEmail([company.email], `Activate ${company.companyName}`, html)
                    .then(ok => resolve(`Activation email sent`))
                    .catch(err => reject(`Error sending activation email ${err}`))
            })
        });
    }
}