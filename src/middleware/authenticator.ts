import { Request, Response, NextFunction } from "express";
import { StatusCode } from "../responses/status.code";
import * as jwt from "jsonwebtoken"
import { Messages } from "../responses/response.messages";
import { AuthService } from "../services/auth.service";
import { ITokenData } from "../interfaces/ITokenData";
import { DecodedToken } from "..";

export async function _authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers["authorization"];
    let token = authHeader && authHeader.split(' ')[1];

    if (!token)
        return res.status(StatusCode.NoToken).json({ error: Messages.NoToken });

    try {
        token = await AuthService.Decrypt(token);
    }
    catch (err) {
        return res.status(StatusCode.BadToken).json({ error: Messages.BadToken });
    }

    jwt.verify(token, String(process.env.ACCESS_TOKEN), (err, access) => {
        if (err) return res.status(StatusCode.BadToken).json({ error: Messages.BadToken });
        req.data = access as DecodedToken;
        next();
    })
}
