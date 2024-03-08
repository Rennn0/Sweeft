import express, { Request, Response, NextFunction } from "express";
import { _authenticateToken } from "../middleware/authenticator";
import { _validateRequestBody } from "../middleware/validators";
import { PasswordChangeRequest } from "../models/PasswordChangeRequest";
import { ContentService } from "../services/content.service";
import { StatusCode } from "../responses/status.code";
import { Messages } from "../responses/response.messages";
import { SubChangeRequest } from "../models/SubsChangeRequest";
import { Subscriptions } from "../models/Subscriptions";

export const contentRouter = express.Router();
contentRouter.use(_authenticateToken);

contentRouter.put(
    "/change/password",
    (req: Request, res: Response, next: NextFunction) =>
        _validateRequestBody(req, res, next, new PasswordChangeRequest()),
    async (req: Request, res: Response) => {
        const contentService = new ContentService();
        const id = req.data.companyId;
        const { newPassword } = req.body;
        await contentService.ChangePassword(id, newPassword);
        return res.send(StatusCode.Updated).json({ message: Messages.Updated });
    }
)

contentRouter.post(
    "/change/subscription",
    (req: Request, res: Response, next: NextFunction) =>
        _validateRequestBody(req, res, next, new SubChangeRequest()),
    async (req: Request, res: Response) => {
        const { plan } = req.body;
        if (!Subscriptions.includes(plan))
            return res.status(StatusCode.BadRequest).json(Messages.BadRequest);

        try {
            await ContentService.ChangeSubscription(req.data.companyId, plan);
            return res.status(StatusCode.Ok).json({ message: Messages.Updated });
        }
        catch (error) {
            return res.status(StatusCode.Conflict).json(error);
        }
    }
)
