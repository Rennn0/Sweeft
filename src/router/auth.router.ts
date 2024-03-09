import express, { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { _validateRequestBody } from "../middleware/validators";
import { CompanyRequest } from "../models/CompanyRequest";
import { Messages } from "../responses/response.messages";
import { StatusCode } from "../responses/status.code";
import { LoginRequest } from "../models/LoginRequest";
import { ILoginRequest } from "../interfaces/ILoginRequest";
import jwt from "jsonwebtoken"
import { _authenticateToken } from "../middleware/authenticator";
import { ITokenData } from "../interfaces/ITokenData";
import { UserLoginRequest } from "../models/UserLoginRequest";
import { IUserLogin } from "../interfaces/IUserLogin";
import { Employee } from "../entity/employee";
import { IUserTokenData } from "../interfaces/IUserTokenData";

export const authRouter = express.Router();

authRouter.post(
    "/registration",
    (req: Request, res: Response, next: NextFunction) => {
        _validateRequestBody(req, res, next, new CompanyRequest())
    },
    async (req: Request, res: Response) => {
        const authService = new AuthService();
        const company: CompanyRequest = req.body;
        try {
            const result = await authService.SendActivationEmail(company);
            res.json({ result: result, timestamp: Date.now().toString() })
        } catch (error) {
            res.status(StatusCode.BadRequest).json({ error })
        }
    });

authRouter.post(
    "/login",
    (req: Request, res: Response, next: NextFunction) => {
        _validateRequestBody(req, res, next, new LoginRequest())
    },
    async (req: Request, res: Response) => {
        const loginRequest: ILoginRequest = req.body;
        const company = await AuthService.Exists(loginRequest);

        if (company == null)
            return res.status(StatusCode.NotFound).json({ message: Messages.NotFound })

        const data: ITokenData = { companyId: company, iat: 0 };
        let accessToken = jwt.sign(data, String(process.env.ACCESS_TOKEN));
        accessToken = await AuthService.Encrypt(accessToken);
        return res.json({ accessToken })
    }
)

authRouter.post(
    "/login-employee",
    (req: Request, res: Response, next: NextFunction) => {
        _validateRequestBody(req, res, next, new UserLoginRequest())
    },
    async (req: Request, res: Response) => {
        const userLoginReq: IUserLogin = req.body;
        try {
            const user = await AuthService.UserExists(userLoginReq);
            if (user instanceof Employee) {
                const tokenData: IUserTokenData = {
                    employeeId: user.employeeId,
                    isAdmin: user.isAdmin,
                    iat: 0
                };
                let accessToken = jwt.sign(tokenData, String(process.env.ACCESS_TOKEN));
                accessToken = await AuthService.Encrypt(accessToken);
                return res.status(StatusCode.Ok).json({ accessToken });
            } else {
                return res.status(StatusCode.BadRequest).send({ message: Messages.BadRequest });
            }
        } catch (error) {
            return res.status(StatusCode.NotFound).send({ message: Messages.NotFound });
        }
    }
)


authRouter.get(
    "/activate",
    async (req: Request, res: Response) => {
        const companyId = parseInt(req.query.id as string);
        const result = await AuthService.ActivateCompany(companyId);
        return result ?
            res.status(StatusCode.Ok).json({ message: Messages.Activated }) :
            res.status(StatusCode.Conflict).json({ message: Messages.Conflict })
    }
)

authRouter.get(
    "/activate-employee",
    async (req: Request, res: Response) => {
        if (!req.query.employeeId || !req.query.password) {
            return res.status(StatusCode.BadRequest).json({ message: Messages.BadRequest });
        }
        const employeeId = parseInt(req.query.employeeId as string);
        const password = req.query.password as string;
        const authService = new AuthService();
        await authService.ActivateEmployee(employeeId, password)
            .then(() => res.status(StatusCode.Ok).json({ message: Messages.Activated }))
            .catch((err) => res.status(StatusCode.Conflict).json(err));

    }
)


