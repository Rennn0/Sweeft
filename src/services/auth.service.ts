import { Email } from "./email.service";
import * as fs from 'fs';
import * as HandleBars from 'handlebars';
import { CompanyRequest } from "../models/CompanyRequest";
import { Company } from "../entity/company";
// use this for passwords, generates strong hash but is slow
// elsewhere goes crypto
import bcrypt, { hash } from "bcrypt"
import { DbContext } from "..";
import * as forge from "node-forge"
import { Messages } from "../responses/response.messages";
import { ILoginRequest } from "../interfaces/ILoginRequest";
import { Employee } from "../entity/employee";
import { IUserLogin } from "../interfaces/IUserLogin";
import path from "path"

/**
 * I decided to use secret token generation thats lifecicle = server
 * storing keys in db would be also good option but for simplicity im going this way
 */
const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });

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
            if (!AuthService.ValidateEmail(company.email))
                return reject(Messages.InvalidEmail);

            const templatePath = path.join(__dirname, "..", "templates", "activation.email.html");
            fs.readFile(templatePath, "utf8", async (err, template) => {
                if (err)
                    return reject(`${Messages.FileOpenError} _ ${err}`);

                const compiledTemplate = HandleBars.compile(template);
                const companyId = await this.RegisterNewCompany(company);

                const html = compiledTemplate({ company, companyId });
                this.SendEmail([company.email], `Activate ${company.companyName}`, html)
                    .then(ok => resolve(Messages.ActivationEmail))
                    .catch(err => reject(`${Messages.ActivationEmailError} _ ${err}`))
            })
        });
    }

    protected SendEmployeeActivationEmail(employee: Employee, companyName: string, companyEmail: string): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            const templatePath = path.join(__dirname, "..", "templates", "employeeActivation.email.html");
            fs.readFile(templatePath, "utf-8", async (err, template) => {
                if (err)
                    return reject(`${Messages.FileOpenError} _ ${err}`);

                const compiledTemplate = HandleBars.compile(template);
                const { username, employeeId, email } = employee;

                const html = compiledTemplate({ username, employeeId, companyEmail, companyName });
                this.SendEmail([email], "Accound activation", html)
                    .then(ok => resolve(Messages.ActivationEmail))
                    .catch(err => reject(`${Messages.ActivationEmailError} _ ${err}`))
            })
        })
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
                .where("companyId=:id AND isActivated=0", { id: companyId })
                .execute()
                .then(result => resolve(Number(result.affected) > 0))
                .catch(err => {
                    console.error(err);
                    return resolve(false)
                });
        })
    }

    public async ActivateEmployee(employeeId: number, password: string): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            password = await this.GetHashedPassword(password);
            await DbContext.getRepository(Employee)
                .createQueryBuilder()
                .update(Employee)
                .set({ isActivated: true, password: password })
                .where(`employeeId=${employeeId} AND isActivated=0`)
                .execute()
                .then(() => resolve())
                .catch((error) => reject(error));
        })
    }

    public static async Encrypt(token: string): Promise<string> {
        return new Promise<string>(async resolve => {
            const publicKey = keyPair.publicKey;
            const encrypted = publicKey.encrypt(token);
            const result = forge.util.encode64(encrypted);
            resolve(result);
        })
    }

    public static async Decrypt(encryptedText: string): Promise<string> {
        try {
            const decrypted = await new Promise<string>((resolve, reject) => {
                const privateKey = keyPair.privateKey;
                const encrypted = forge.util.decode64(encryptedText);
                try {
                    const decrypted = privateKey.decrypt(encrypted);
                    resolve(decrypted);
                } catch (err) {
                    reject(Messages.BadToken);
                }
            })
            return decrypted;
        }
        catch (err) {
            throw err;
        }
    }

    /**
     * 
     * @param company ILoginRequest
     * @returns companyId if exists, else null
     */
    public static async Exists(company: ILoginRequest): Promise<number | null> {
        return new Promise<number | null>(async (resolve, reject) => {
            const byEmail = await DbContext.getRepository(Company)
                .createQueryBuilder()
                .where("email=:email", { email: company.email })
                .getOneOrFail()
                .catch(error => reject(error));

            if (!(byEmail instanceof Company))
                return resolve(null);

            const byPassword = await AuthService.ValidatePassword(company.password, byEmail.password);

            if (!byPassword)
                return resolve(null);

            return resolve(byEmail!.companyId);
        })
    }

    public static async UserExists(user: IUserLogin): Promise<Employee | null> {
        return new Promise<Employee | null>(async (resolve, reject) => {
            const byUsername = await DbContext.getRepository(Employee)
                .createQueryBuilder()
                .where("username=:username", { username: user.username })
                .getOneOrFail()
                .catch(error => reject(error));

            if (byUsername instanceof Employee) {
                const byPassword = await AuthService.ValidatePassword(user.password, byUsername.password);
                if (byPassword) {
                    return resolve(byUsername);
                } {
                    return reject(null);
                }
            } else {
                return reject(null);
            }
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

                record.password = await this.GetHashedPassword(company.password);

                const response = await DbContext.getRepository(Company).save(record);
                resolve(response.companyId);
            }
            catch (err) {
                reject(err);
            }
        })
    }


    protected async GetHashedPassword(password: string): Promise<string> {
        return new Promise<string>(async resolve => {
            const hashedPassword = await bcrypt.hash(password, 10);
            return resolve(hashedPassword);
        })
    }

    /**
     * 
     * @param data password
     * @param encrypted stored hash
     * @returns 
     */
    protected static async ValidatePassword(data: string, encrypted: string): Promise<boolean> {
        return new Promise<boolean>(async resolve => {
            const isValid = await bcrypt.compare(data, encrypted);
            return resolve(isValid);
        })
    }

    protected static ValidateEmail(email: string) {
        return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
    }
}