import express, { Request, Response, NextFunction } from "express";
import { _authenticateToken } from "../middleware/authenticator";
import { _validateRequestBody } from "../middleware/validators";
import { PasswordChangeRequest } from "../models/PasswordChangeRequest";
import { ContentService } from "../services/content.service";
import { StatusCode } from "../responses/status.code";
import { Messages } from "../responses/response.messages";
import { SubChangeRequest } from "../models/SubsChangeRequest";
import { Subscriptions } from "../models/Subscriptions";
import { ChangeCompanyRequest } from "../models/ChangeCompanyRequest";
import { EmployeeRequest } from "../models/EmployeeRequest";
import { _companyAccess } from "../middleware/company.access";
import { _employeeAccess } from "../middleware/employee.access";
import multer from "multer";
import { Mimetypes } from "../models/Mimetypes";

export const contentRouter = express.Router();
contentRouter.use(_authenticateToken);

const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, "uploads/")
    },
    filename(req, file, callback) {
        callback(null, file.originalname);
    },
})
const upload = multer({ storage: storage });

contentRouter.put(
    "/change/password",
    (req: Request, res: Response, next: NextFunction) => {
        _validateRequestBody(req, res, next, new PasswordChangeRequest());
        _companyAccess(req, res, next);
    },
    async (req: Request, res: Response) => {
        const contentService = new ContentService();
        const id = req.data.companyId;
        const { newPassword } = req.body;
        await contentService.ChangePassword(id, newPassword);
        return res.status(StatusCode.Updated).json({ message: Messages.Updated });
    }
)

contentRouter.post(
    "/change/subscription",
    (req: Request, res: Response, next: NextFunction) => {
        _validateRequestBody(req, res, next, new SubChangeRequest());
        _companyAccess;
    },
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

contentRouter.post(
    "/change/copmany-information",
    (req: Request, res: Response, next: NextFunction) => {
        _validateRequestBody(req, res, next, new ChangeCompanyRequest());
        _companyAccess(req, res, next);
    },
    async (req: Request, res: Response) => {
        await ContentService.UpdateCompanyRecord(req.body, req.data.companyId)
            .then(() => res.status(StatusCode.Updated).json({ message: Messages.Updated }))
            .catch(err => res.status(StatusCode.Conflict).json(err));
    }
)

contentRouter.post(
    "/add/employee",
    (req: Request, res: Response, next: NextFunction) =>
        _validateRequestBody(req, res, next, new EmployeeRequest()),
    async (req: Request, res: Response) => {
        const contentService = new ContentService();
        await contentService.AddNewEmployee(req.body, req.data.companyId)
            .then((msg) => res.status(StatusCode.Ok).json(msg))
            .catch((err) => res.status(StatusCode.Conflict).json(err));
    }
)


contentRouter.get(
    "/employee-list",
    _employeeAccess,
    async (req: Request, res: Response) => {
        if (req.data?.isAdmin) {
            const result = await ContentService.EmployeeList(req.data.employeeId);
            return res.status(StatusCode.Ok).json(result);
        } else {
            return res.status(StatusCode.BadRequest).json({ message: Messages.AdminInfo })
        }
    }
)

contentRouter.delete(
    "/delete/employee",
    async (req: Request, res: Response) => {
        if (req.data.hasOwnProperty("companyId") || req.data.hasOwnProperty("isAdmin")) {
            const employeeId = parseInt(req.query.employeeId as string);
            try {
                const deleteResult = await ContentService.DeleteEmployee(employeeId);
                return res.status(StatusCode.Ok).json(deleteResult);
            } catch (error) {
                return res.status(StatusCode.Conflict).json(error)
            }
        } else {
            return res.status(StatusCode.BadToken).json({ message: Messages.BadToken });
        }
    }
)

contentRouter.post(
    "/upload/file",
    _employeeAccess,
    upload.single('file'),
    async (req: Request, res: Response) => {
        if (req.file && Mimetypes.includes(req.file.mimetype)) {
            try {
                const { all, employees } = req.query;
                const file = req.file;

                const visibleForAll = all == "true" ? true : false;
                const employeeIds: number[] = JSON.parse(employees as string);

                await ContentService.UploadFile(req.data.employeeId, file, visibleForAll, employeeIds);

                return res.status(StatusCode.Ok).json({ message: Messages.Added });
            } catch (error) {
                return res.json(error)
            }
        } else {
            return res.status(StatusCode.BadRequest).json({ message: Messages.BadRequest });
        }
    }
)

contentRouter.put(
    "/change/visibility",
    _employeeAccess,
    async (req: Request, res: Response) => {
        try {
            const { all, employees, fileId } = req.query;

            const visibleForAll = all == "true" ? true : false;
            const employeeIds: number[] = JSON.parse(employees as string);
            const fId = parseInt(fileId as string);

            await ContentService.ChangeVisibility(req.data.employeeId, fId, visibleForAll, employeeIds);
            return res.status(StatusCode.Ok).json({ message: Messages.Updated });
        } catch (error) {
            return res.status(StatusCode.BadRequest).json(error);
        }
    }
)

contentRouter.delete(
    "/delete/file",
    _employeeAccess,
    async (req: Request, res: Response) => {
        try {
            const { fileId } = req.query;
            const _fileId = parseInt(fileId as string);

            await ContentService.DeleteFile(req.data.employeeId, _fileId);
            return res.status(StatusCode.Ok).json({ message: Messages.Deleted });

        } catch (error) {
            return res.status(StatusCode.BadRequest).json(error);
        }
    }
)