import { DeleteResult, In, Repository } from "typeorm";
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
import { FileUpload } from "../entity/fileUploads";

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

    public static async EmployeeList(employeeId: number): Promise<IEmployeeList[]> {
        return new Promise<IEmployeeList[]>(async resolve => {
            const repoEmp = DbContext.getRepository(Employee);
            const company = await repoEmp.findOneBy({ employeeId: employeeId }).then((data) => data?.company)
            const list = await repoEmp.find({ where: { company: company } });
            const mappedList: IEmployeeList[] = list.map(emp => {
                const { username, email, isActivated, isAdmin, employeeId } = emp;
                return { username, email, isActivated, isAdmin, employeeId };
            })
            resolve(mappedList);
        })
    }

    public static async DeleteEmployee(employeeId: number): Promise<DeleteResult> {
        return new Promise<DeleteResult>(async (resolve, reject) => {
            try {
                const repoFfile = DbContext.getRepository(FileUpload);
                const files = await repoFfile.find({ where: { author: { employeeId: employeeId } } });
                if (files.length > 0) {
                    for (const file of files) {
                        file.author = null;
                        await repoFfile.save(file);
                    }
                }
                const deleteResult: DeleteResult = await DbContext.getRepository(Employee)
                    .delete({ employeeId: employeeId });
                resolve(deleteResult);
            } catch (error) {
                reject(error);
            }
        })
    }

    public static async UploadFile(authorId: number, file: Express.Multer.File, forAll: boolean, employeeIds: number[]): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const fileUplad = new FileUpload();
                fileUplad.author = await DbContext.getRepository(Employee).findOneBy({ employeeId: authorId });
                fileUplad.extension = file.mimetype;
                fileUplad.fileName = file.originalname!;
                fileUplad.filePath = file.path;
                fileUplad.uploadDate = Date.now();
                fileUplad.size = file.size!;

                if (forAll) {
                    fileUplad.visibleForAll = true;
                } else {
                    fileUplad.visibleForAll = false;
                    const employees = await DbContext.getRepository(Employee).find({ where: { employeeId: In(employeeIds) } });

                    fileUplad.visibleFor = employees;
                }
                await DbContext.getRepository(FileUpload).save(fileUplad);
                return resolve();
            } catch (error) {
                reject(error)
            }
        })
    }

    public static async ChangeVisibility(employeeId: number, fileId: number, forAll: boolean, employeeIds: number[]): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            const repoFile = DbContext.getRepository(FileUpload);
            const repoEmployee = DbContext.getRepository(Employee);

            const file = await repoFile.findOneBy({ author: { employeeId: employeeId }, fileId: fileId });
            if (!file)
                return reject("File not found");

            if (forAll) {
                file.visibleForAll = true;
                file.visibleFor = [];
            }
            else {
                const employees = await repoEmployee.find({ where: { employeeId: In(employeeIds) } });
                file.visibleForAll = false;
                file.visibleFor = employees;
            }

            await repoFile.save(file);
            return resolve("Ok");

        })
    }

    public static async DeleteFile(employeeId: number, fileId: number): Promise<any> {
        return new Promise<void>(async (resolve, reject) => {
            const repoFile = DbContext.getRepository(FileUpload);

            const file = await repoFile.findOneBy({ fileId: fileId, author: { employeeId: employeeId } });
            if (!file)
                return reject("File not found");

            await DbContext.getRepository(FileUpload).createQueryBuilder()
                .delete()
                .where(file)
                .execute();

            resolve();
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