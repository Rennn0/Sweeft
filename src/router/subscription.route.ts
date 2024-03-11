import express, { Request, Response, NextFunction } from "express"
import { _authenticateToken } from "../middleware/authenticator";
import { _companyAccess } from "../middleware/company.access";
import { StatusCode } from "../responses/status.code";
import { Messages } from "../responses/response.messages";
import { SubscriptionService } from "../services/subscription.service";

export const subscriptionRouter = express.Router();
subscriptionRouter.use(_authenticateToken);

subscriptionRouter.get(
    "/current-billing",
    _companyAccess,
    async (req: Request, res: Response) => {
        try {
            const price = await SubscriptionService.ComputePrice(req.data.companyId);
            return res.status(StatusCode.Ok).json({ price: price });
        } catch (error) {
            return res.status(StatusCode.BadRequest).json({ message: Messages.BadRequest });
        }
    }
)