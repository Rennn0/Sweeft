import { IChangeCompanyRequest } from "../interfaces/IChangeCompanyRequest";

export class ChangeCompanyRequest implements IChangeCompanyRequest {
    companyName: string = '';
    email: string = '';
    country: string = '';
    industry: string = '';
}