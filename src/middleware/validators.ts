import { Request, Response, NextFunction } from "express";
export function _validateRequestBody<T extends {}>(req: Request, res: Response, next: NextFunction, interfaceType: T) {
    const requiredProperties = Object.getOwnPropertyNames(interfaceType);
    for (const prop of requiredProperties) {
        if (!req.body[prop]) {
            return res.status(400).json({ error: `Missing property _ ${prop}` });
        }
    }
    next();
}