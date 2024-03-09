import { IUserLogin } from "../interfaces/IUserLogin";

export class UserLoginRequest implements IUserLogin {
    username: string = '';
    password: string = '';
}