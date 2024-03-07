import { IPasswordChangeRequest } from "../interfaces/IPasswordChangeRequest";

export class PasswordChangeRequest implements IPasswordChangeRequest {
    newPassword: string = '';
}