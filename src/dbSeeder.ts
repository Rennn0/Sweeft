import { Repository } from "typeorm";
import { Company } from "./entity/company";
import { SubscriptionType } from "./entity/subscriptionType";
import { SubscriptionTier } from "./entity/subscriptionTier";
import { Employee } from "./entity/employee";
import { FileUpload } from "./entity/fileUploads";
import { DbContext } from ".";

export async function SeedComapny(
    companyRepo: Repository<Company>,
    subTypeRepo: Repository<SubscriptionType>,
    subTierRepo: Repository<SubscriptionTier>
) {
    const typeFree = await subTypeRepo.findOne({ where: { tier: 100 } });
    let freeTier = new SubscriptionTier();
    let company = new Company();

    freeTier.computedPrice = 0;
    freeTier.subscriptionType = typeFree;
    freeTier.activationDate = Date.now();

    company.country = "Georgia";
    company.email = "Luka@gmail.com";
    company.industry = "Finance";
    company.isActivated = true;
    company.password = "SomePASS";

    await companyRepo
        .save(company)
        .then(async () => {
            freeTier.company = company;
            company.subscription = freeTier;
            await subTierRepo.save(freeTier)
                .then(async () => {
                    await companyRepo.save(company);
                })
                .catch(err => console.error(err));
        })
        .catch(err => console.error(err));
}

// THIS ONLY HAPPENS ONCE
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


export async function SeedEmployee(empRepo: Repository<Employee>) {
    let employee = new Employee();
    employee.company = await DbContext.getRepository(Company).findOne({ where: { country: "Georgia" } });
    employee.isAdmin = true;
    employee.mail = "admin@gmail.com";
    employee.password = "adminPAss";
    employee.username = "admin";
    await empRepo.save(employee);
}

export async function SeedFileUpload(subTypeRepo: Repository<FileUpload>) {

}