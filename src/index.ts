import "reflect-metadata"
import express from 'express';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Company } from './entity/company';
import { SubscriptionType } from './entity/subscriptionType';
import { SubscriptionTier } from './entity/subscriptionTier';
import { Employee } from './entity/employee';
import { FileUpload } from './entity/fileUploads';
import { authRouter } from "./router/auth.router";
import morgan from "morgan";
import { contentRouter } from "./router/content.router";
import { ITokenData } from "./interfaces/ITokenData";
import { SeedComapny, SeedEmployee, SeedFileUpload, SeedSubTier, SeedSubType } from "./dbSeeder";
dotenv.config();

const port = process.env.PORT;
const app = express();

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

declare global {
    namespace Express {
        interface Request {
            data: ITokenData
        }
    }
}

app.use(express.json());
app.use(morgan(":method :url :status :res[content-length] - :response-time ms"));
app.use('/api/auth', authRouter);
app.use('/api/content', contentRouter);


DbContext.initialize()
    .then(() => console.log("Connected to database"))
    .catch((error) => console.error(error))
// .then(async () => {
//     const data = await DbContext.getRepository(Company).find({ relations: { subscriptions: true } });
//     for (const unit of data) {
//         console.log(unit);
//     }
// })


app.listen(port, () => console.log(`Listenin on port ${port}`))