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
