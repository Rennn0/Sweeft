import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../responses/status.code";
import { Messages } from "../responses/response.messages";
export function _companyAccess(req: Request, res: Response, next: NextFunction) {
    if (req.data && req.data.hasOwnProperty('companyId')) {
        next();
    } else {
        return res.sendStatus(StatusCode.BadToken).json({ error: Messages.BadToken });
    }
}