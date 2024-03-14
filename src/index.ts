import "reflect-metadata"
import express from 'express';
import dotenv from 'dotenv';
import morgan from "morgan";
import { DataSource, Repository } from 'typeorm';
import { Company } from './entity/company';
import { SubscriptionType } from './entity/subscriptionType';
import { SubscriptionTier } from './entity/subscriptionTier';
import { Employee } from './entity/employee';
import { FileUpload } from './entity/fileUploads';
import { authRouter } from "./router/auth.router";
import { contentRouter } from "./router/content.router";
import { ITokenData } from "./interfaces/ITokenData";
import { SeedComapny, SeedEmployee, SeedFileUpload, SeedSubTier, SeedSubType } from "./dbSeeder";
import { IUserTokenData } from "./interfaces/IUserTokenData";
import { subscriptionRouter } from "./router/subscription.route";
dotenv.config();

const port = process.env.PORT;
const app = express();

process.on('uncaughtException', (error, origin) => {
    console.error(`Uncaught Exception ${error}`, origin);
    // some logging would be nice
})

process.on('unhandledRejection', (reason, promise) => {
    console.error(`Unhandled rejection ${reason}`);
})

export const DbContext = new DataSource({
    type: "mssql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [ // include entities that should sync with db
        Company,
        SubscriptionType,
        SubscriptionTier,
        Employee,
        FileUpload
    ],
    synchronize: true, // false for prod (apply migrations)
    logging: false,
    options: { encrypt: false } // false if self signed cert from db
})

export type DecodedToken = ITokenData & IUserTokenData;
declare global {
    namespace Express {
        interface Request {
            data: DecodedToken,
        }
    }
}

app.use(express.json());
app.use(morgan(":method :url :status :res[content-length] - :response-time ms"));
app.use("/api/auth", authRouter);
app.use("/api/content", contentRouter);
app.use("/api/subscription", subscriptionRouter);

DbContext.initialize()
    .then(() => console.log("Connected to database"))
    .then(async () => {
        console.log("Seeding Db...");
        await SeedSubType(DbContext.getRepository(SubscriptionType)).then(() => console.log("Seeding complete (make sure this happens once)"));
    })
    .catch((error) => console.error(error))

app.listen(port, () => console.log(`Listenin on port ${port}`))
app.get("/", (req, res) => {
    res.send(`Hello Sweeft from ${req.headers.host}`);
})