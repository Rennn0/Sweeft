import { ILoginRequest } from "../interfaces/ILoginRequest";

export class LoginRequest implements ILoginRequest {
    email: string = '';
    password: string = '';
}