import { Email } from "./email.service";
import * as fs from 'fs';
import * as HandleBars from 'handlebars';
import { CompanyRequest } from "../models/CompanyRequest";
import { Company } from "../entity/company";
// use this for passwords, generates strong hash but is slow
// elsewhere goes crypto
import bcrypt, { hash } from "bcrypt"
import { DbContext } from "..";

export class AuthService extends Email {
    constructor() {
        super();
    }

    /**
     * @description registers new company and sends activation email
     * @param company 
     * @returns status description after exec
     */
    public SendActivationEmail(company: CompanyRequest): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            fs.readFile("src\\templates\\activation.email.html", "utf8", async (err, template) => {
                if (err)
                    reject(`Error opening file ${err}`);

                const compiledTemplate = HandleBars.compile(template);
                const companyId = await this.RegisterNewCompany(company);

                const html = compiledTemplate({ company, companyId });
                this.SendEmail([company.email], `Activate ${company.companyName}`, html)
                    .then(ok => resolve(`Activation email sent`))
                    .catch(err => reject(`Error sending activation email ${err}`))
            })
        });
    }

    /**
     * 
     * @param companyId 
     * @returns true if unactivated company record found
     */
    public static async ActivateCompany(companyId: number): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            await DbContext
                .createQueryBuilder()
                .update(Company)
                .set({ isActivated: true })
                .where("companyId=:id AND isActivated=false", { id: companyId })
                .execute()
                .then(result => resolve(Number(result.affected) > 0))
                .catch(err => resolve(false));
        })
    }

    /**
     * @description inserts new company into db with isActivated=false
     * @param company 
     * @returns companyId
     */
    private async RegisterNewCompany(company: CompanyRequest): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {
                let record = new Company();
                record.companyName = company.companyName;
                record.country = company.country;
                record.email = company.email;
                record.industry = company.industry;
                record.isActivated = false; // will change status if email gets confirmed

                const hashedPassword = await bcrypt.hash(company.password, 10);
                record.password = hashedPassword;

                const response = await DbContext.getRepository(Company).save(record);
                resolve(response.companyId);
            }
            catch (err) {
                reject(err);
            }
        })
    }

    /**
     * 
     * @param data password
     * @param encrypted stored hash
     * @returns 
     */
    private static async ValidatePassword(data: string, encrypted: string): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {
            const isValid = await bcrypt.compare(data, encrypted);
            resolve(isValid);
        })
    }
}