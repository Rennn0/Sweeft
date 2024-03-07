import express, { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { _validateRequestBody } from "../middleware/validators";
import { CompanyRequest } from "../models/CompanyRequest";
import { Messages } from "../responses/response.messages";
import { StatusCode } from "../responses/status.code";

export const authRouter = express.Router();

authRouter.post(
    "/registration",
    (req: Request, res: Response, next: NextFunction) => {
        _validateRequestBody(req, res, next, new CompanyRequest())
    },
    async (req: Request, res: Response) => {
        const authService = new AuthService();
        const company: CompanyRequest = req.body;
        const result = await authService.SendActivationEmail(company).catch(err => res.json(err));
        res.json({ result: result, timestamp: Date.now().toString() })
    });

authRouter.get(
    "/activate",
    async (req: Request, res: Response) => {
        const companyId = parseInt(req.query.id as string);
        const result = await AuthService.ActivateCompany(companyId);
        result ?
            res.status(StatusCode.Ok).json({ message: Messages.Activated }) :
            res.status(StatusCode.Conflict).json({ message: Messages.Conflict })
    }
)



