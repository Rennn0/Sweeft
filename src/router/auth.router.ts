import express, { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { _validateRequestBody } from "../middleware/validators";
import { CompanyRequest } from "../models/CompanyRequest";

export const authRouter = express.Router();

authRouter.post(
    '/registration',
    (req: Request, res: Response, next: NextFunction) => {
        _validateRequestBody(req, res, next, new CompanyRequest())
    },
    async (req: Request, res: Response) => {
        const company: CompanyRequest = req.body;
        const authService = new AuthService();
        const result = await authService.SendActivationEmail(company);
        res.json({ result: result, timestamp: Date.now().toString() })
    })

