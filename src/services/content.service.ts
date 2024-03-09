import { Repository } from "typeorm";
import { DbContext } from "..";
import { Company } from "../entity/company";
import { SubscriptionTier } from "../entity/subscriptionTier";
import { SubscriptionType } from "../entity/subscriptionType";
import { AuthService } from "./auth.service";
import { IChangeCompanyRequest } from "../interfaces/IChangeCompanyRequest";
import { IEmployeeRequest } from "../interfaces/IEmployeeRequest";
import { Employee } from "../entity/employee";
import { Messages } from "../responses/response.messages";
import { IEmployeeList } from "../interfaces/IEmployeeList";

export class ContentService extends AuthService {
    constructor() {
        super();
    }

    public async ChangePassword(companyId: number, newPass: string): Promise<void> {
        return new Promise<void>(async (resolve) => {
            const hashedPassword = await this.GetHashedPassword(newPass);
            await DbContext.createQueryBuilder()
                .update(Company)
                .set({ password: hashedPassword })
                .where("companyId=:id", { id: companyId })
                .execute();
            resolve()
        })
    }

    public static async ChangeSubscription(companyId: number, plan: string): Promise<void> {
        return new Promise<void>(async (resolve) => {
            const repoCompany = DbContext.getRepository(Company);
            const repoSubTier = DbContext.getRepository(SubscriptionTier);
            const repoSubType = DbContext.getRepository(SubscriptionType);

            const company = await repoCompany.findOneBy({ companyId: companyId });
            if (company) {
                await ContentService.DeactivateOldSubscription(repoSubTier, company).catch(error => console.error(error));
                await ContentService.ActivateNewSubscription(repoSubTier, repoSubType, company, plan).catch(error => console.error(error));
            }

            resolve();
        })
    }

    public static async UpdateCompanyRecord(data: IChangeCompanyRequest, companyId: number): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            if (!AuthService.ValidateEmail(data.email)) {
                return reject(`Invalid email ${data.email}`);
            }

            await DbContext.getRepository(Company)
                .createQueryBuilder()
                .update(Company)
                .set(data)
                .where(`companyId=${companyId}`)
                .execute()
                .then(() => resolve())
                .catch((err) => reject(err));
        })
    }

    public async AddNewEmployee(data: IEmployeeRequest, copmanyId: number): Promise<string> {
        return new Promise<string>(async (resolve, reject) => {
            if (!AuthService.ValidateEmail(data.email))
                return reject(`Invalid email ${data.email}`);

            const repoEmployee = DbContext.getRepository(Employee);
            const repoCompany = DbContext.getRepository(Company);

            const company = await repoCompany.findOneBy({ companyId: copmanyId });
            const employee = new Employee();
            employee.isActivated = false;
            employee.isAdmin = data.isAdmin;
            employee.email = data.email;
            employee.username = data.username;

            if (company) {
                employee.company = company;

                await repoEmployee.save(employee)
                    .then(async () => {
                        await this.SendEmployeeActivationEmail(employee, company.companyName, company.email)
                            .then((message) => resolve(message))
                            .catch((err) => reject(err))
                    })
                    .catch(err => reject(err));
            }
            else {
                reject(Messages.NotFound);
            }
        })
    }

    public static async EmployeeList(): Promise<IEmployeeList[]> {
        return new Promise<IEmployeeList[]>(async resolve => {
            const list = await DbContext.getRepository(Employee).find();
            const mappedList: IEmployeeList[] = list.map(emp => {
                const { username, email, isActivated, isAdmin, employeeId } = emp;
                return { username, email, isActivated, isAdmin, employeeId };
            })
            resolve(mappedList);
        })
    }

    private static async DeactivateOldSubscription(repoSubTier: Repository<SubscriptionTier>, company: Company): Promise<void> {
        return new Promise<void>(async (resolve) => {
            await repoSubTier.findOneBy({ company: company, isActive: true })
                .then(async (unit) => {
                    if (unit) {
                        unit.isActive = false;
                        unit.deactivationDate = Date.now();
                        /**
                         *  HERE MAY BE PRICE COMPUTAION LOGIC, BUT LATER
                         */
                        await repoSubTier.save(unit);
                    }
                })
                .finally(() => resolve());
        })
    }

    private static async ActivateNewSubscription(repoSubTier: Repository<SubscriptionTier>, repoSubType: Repository<SubscriptionType>, company: Company, newPlan: string): Promise<void> {
        return new Promise<void>(async (resolve) => {
            const type = await repoSubType.findOneBy({ tierName: newPlan }).catch(error => console.error(error));
            if (type instanceof SubscriptionType) {
                const sub = new SubscriptionTier();
                sub.activationDate = Date.now();
                sub.company = company;
                sub.isActive = true;
                sub.subscriptionType = type
                await repoSubTier.save(sub);
            }
            resolve();
        })
    }
}