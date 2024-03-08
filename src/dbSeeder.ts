import { Repository } from "typeorm";
import { Company } from "./entity/company";
import { SubscriptionType } from "./entity/subscriptionType";
import { SubscriptionTier } from "./entity/subscriptionTier";
import { Employee } from "./entity/employee";
import { FileUpload } from "./entity/fileUploads";
import { DbContext } from ".";


// THIS IS FIRST AND MUST HAPPEN ONCE
export async function SeedSubType(subTypeRepo: Repository<SubscriptionType>) {
    let free = new SubscriptionType();
    free.employeeLowerBound = 0;
    free.employeeUpperBound = 1;
    free.fileLowerBound = 0;
    free.fileUpperBound = 10;
    free.fixedPrice = 0;
    free.priceIncrement = 0;
    free.tier = 100;
    free.tierName = "Free";

    let basic = new SubscriptionType();
    basic.employeeLowerBound = 0;
    basic.employeeUpperBound = 10;
    basic.fileLowerBound = 0;
    basic.fileUpperBound = 100;
    basic.fixedPrice = 0;
    basic.priceIncrement = 5;
    basic.tier = 200;
    basic.tierName = "Basic";

    let premium = new SubscriptionType();
    premium.employeeLowerBound = 0;
    premium.employeeUpperBound = -1;
    premium.fileLowerBound = 0;
    premium.fileUpperBound = 1000;
    premium.fixedPrice = 300;
    premium.priceIncrement = 0.5;
    premium.tier = 300;
    premium.tierName = "Premium";

    await subTypeRepo.save([free, basic, premium])
}

// SECOND SEED IS COMPANY
export async function SeedComapny() {
    const repoCompany = DbContext.getRepository(Company);
    const company = new Company();
    company.companyName = "Intel";
    company.country = "Georgia";
    company.email = "some@gmail.com";
    company.industry = "IT";
    company.password = "asd";
    await repoCompany.save(company);
}

export async function SeedSubTier() {
    const repoCompany = DbContext.getRepository(Company);
    const repoSubType = DbContext.getRepository(SubscriptionType);
    const repoSubTier = DbContext.getRepository(SubscriptionTier);

    const tier = new SubscriptionTier();
    tier.subscriptionType = (await repoSubType.findOneBy({ tierName: "Free" }))!;
    tier.company = (await repoCompany.findOneBy({ companyId: 2 }))!;
    tier.activationDate = Date.now();
    tier.isActive = true;

    await repoSubTier.save(tier);
}

export async function SeedEmployee() {
    const repoCompany = DbContext.getRepository(Company);
    const repoEmployee = DbContext.getRepository(Employee);
    let employee = new Employee();
    const company = await repoCompany.findOneBy({ companyId: 1 });
    employee.isAdmin = false;
    employee.mail = "admin@gmail.com";
    employee.password = "adminPass3";
    employee.username = "notadmin";
    employee.company = company!;
    await repoEmployee.save(employee);
}

export async function SeedFileUpload() {
    const repoFile = DbContext.getRepository(FileUpload);
    const employee = await DbContext.getRepository(Employee).findOneBy({ employeeId: 2 });
    const file = new FileUpload();
    file.extension = ".docx";
    file.uploadDate = Date.now();
    file.visibleForAll = false;
    file.author = employee!;
    await repoFile.save(file);
}