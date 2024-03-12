import { DbContext, DecodedToken } from "..";
import { Company } from "../entity/company";
import { Employee } from "../entity/employee";
import { SubscriptionTier } from "../entity/subscriptionTier";
import { BasicSubscription } from "../models/Subscription.Basic";
import { FreeSubscription } from "../models/Subscription.Free";
import { PremiumSubscription } from "../models/Subscription.Premium";
import { SubscriptionParameter } from "../models/subParam";

export class SubscriptionService {
    constructor() { }

    public static ComputePrice(companyId: number): Promise<number> {
        return new Promise<number>(async (resolve, reject) => {
            //LOAD ALL RELATIONS
            const sub = await DbContext.getRepository(SubscriptionTier)
                .findOne({ where: { company: { companyId: companyId }, isActive: true }, relations: ['company', 'company.employees', 'company.employees.files', 'subscriptionType'] });

            if (sub) {
                const isMonthPassed = sub.lastPaymentDate == 0 ?
                    SubscriptionService.MonthPassed(sub.activationDate) :
                    SubscriptionService.MonthPassed(sub.lastPaymentDate);
                if (!isMonthPassed)
                    return resolve(0);


                let price = 0;
                switch (sub?.subscriptionType.tierName) {
                    case "Free":
                        const free = new FreeSubscription(sub);
                        price = free.ComputePrice();
                        break;
                    case "Basic":
                        const basic = new BasicSubscription(sub);
                        price = basic.ComputePrice();
                        break;
                    case "Premium":
                        const premium = new PremiumSubscription(sub);
                        price = premium.ComputePrice();
                        break;
                }

                await SubscriptionService.UpdateSubscription(sub.tierId, price);
                return resolve(price);
            }
            return resolve(0);
        })
    }

    public static async EnabledBySubscription(param: SubscriptionParameter): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            switch (param.type) {
                case "decodedToken": // when /add/employee  (has both company and admin access)
                    if (param.data.employeeId) {
                        const employee = await DbContext.getRepository(Employee)
                            .findOne({
                                where: {
                                    employeeId: param.data.employeeId,
                                    company: {
                                        subscriptions: {
                                            isActive: true
                                        }
                                    }
                                },
                                relations: ["company", "company.employees", "company.subscriptions", "company.subscriptions.subscriptionType"]
                            });
                        if (employee) {
                            const enabled = await SubscriptionService.SubEnablesNewEmployee(employee.company);
                            return resolve(enabled);
                        }
                        return resolve(false);
                    } else if (param.data.companyId) {
                        const company = await DbContext.getRepository(Company)
                            .findOne({
                                where: {
                                    companyId: param.data.companyId,
                                    subscriptions: {
                                        isActive: true
                                    }
                                },
                                relations: ["subscriptions", "employees", "subscriptions.subscriptionType"]
                            });
                        if (company) {
                            const enabled = await SubscriptionService.SubEnablesNewEmployee(company);
                            return resolve(enabled);
                        }
                        return resolve(false);
                    }
                    break;

                case "employeeId": // when /upload/file (has only employee access)
                    // data is employeeId itself
                    const employee = await DbContext.getRepository(Employee)
                        .findOne({
                            where: {
                                employeeId: param.data,
                                company: {
                                    subscriptions: {
                                        isActive: true
                                    }
                                }
                            },
                            relations: ["company", "company.subscriptions", "company.employees", "company.employees.files", "company.subscriptions.subscriptionType"]
                        });
                    if (employee) {
                        const enabled = await SubscriptionService.SubEnablesNewFile(employee.company);
                        return resolve(enabled);
                    }
                    return resolve(false);
                    break;
            }
            return resolve(false);
        })
    }

    private static async SubEnablesNewEmployee(company: Company): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            if (company.subscriptions[0].subscriptionType.tierName == "Premium")
                return resolve(true)

            const employeeCount = company.employees.filter(x => x.isActivated).length;
            const limit = company.subscriptions[0].subscriptionType.employeeUpperBound;
            return resolve(employeeCount < limit);
        })
    }

    private static async SubEnablesNewFile(company: Company): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            const fileLimit = company.subscriptions[0].subscriptionType.fileUpperBound;
            const filesUploaded = company.employees.reduce((prev, curr) => prev + curr.files.length, 0);
            return resolve(filesUploaded < fileLimit);
        })
    }

    private static MonthPassed(time: number): boolean {
        const oneMonthMs = 30 * 24 * 360 * 1000;
        const currentTime = Date.now();
        return currentTime >= (time + oneMonthMs);
    }

    private static async UpdateSubscription(tierId: number, amount: number): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            await DbContext.getRepository(SubscriptionTier).createQueryBuilder()
                .update(SubscriptionTier)
                .set({ computedPrice: amount, lastPaymentDate: Date.now() })
                .where(`tierId=${tierId}`)
                .execute()
                .then(() => resolve())
                .catch(err => reject())
        })
    }
}