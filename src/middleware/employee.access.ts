import { NextFunction, Request, Response } from "express";
import { StatusCode } from "../responses/status.code";
import { Messages } from "../responses/response.messages";
export function _employeeAccess(req: Request, res: Response, next: NextFunction) {
    if (req.data && req.data.hasOwnProperty('employeeId')) {
        next();
    } else {
        return res.status(StatusCode.BadToken).json({ error: Messages.BadToken });
    }
}