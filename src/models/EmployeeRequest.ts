import { IEmployeeRequest } from "../interfaces/IEmployeeRequest";

export class EmployeeRequest implements IEmployeeRequest {
    username: string = '';
    email: string = '';
    isAdmin: boolean = false;
}