import { DecodedToken } from "..";

export type SubscriptionParameter = {
    type: "decodedToken";
    data: DecodedToken
} |
{
    type: "employeeId",
    data: number,
}
