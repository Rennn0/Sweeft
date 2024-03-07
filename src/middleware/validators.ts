import { Request, Response, NextFunction } from "express";
import { StatusCode } from "../responses/status.code";
import { Messages } from "../responses/response.messages";

export function _validateRequestBody<T extends object>(req: Request, res: Response, next: NextFunction, interfaceType: T) {
    const requiredProperties = Object.getOwnPropertyNames(interfaceType);
    for (const prop of requiredProperties) {
        if (!req.body[prop]) {
            return res.status(StatusCode.BadRequest).json({ error: Messages.Missing, property: prop });
        }
    }
    next();
}