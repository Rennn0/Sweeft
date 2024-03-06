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
dotenv.config();

const port = process.env.PORT;
const app = express();

export const DbContext = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [
        Company,
        SubscriptionType,
        SubscriptionTier,
        Employee,
        FileUpload
    ],
    synchronize: true,
    logging: false,
})

app.use(express.json());
app.use(morgan(":method :url :status :res[content-length] - :response-time ms"));
app.use('/api/auth', authRouter)

DbContext.initialize()
    .then(() => console.log("TypeOrm connected successfully"))
    .catch((error) => console.error(error))

app.listen(port, () => console.log(`Listenin on port ${port}`))