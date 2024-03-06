import { ICompanyRequest } from "../interfaces/ICompanyRequest";

export class CompanyRequest implements ICompanyRequest {
    companyName: string = '';
    email: string = '';
    password: string = '';
    country: string = '';
    industry: string = '';
}