import { Types } from "mongoose"
import { User } from "../models/user.model"
import jwt from "jsonwebtoken"
import { SECRETPASS } from "./env"

export interface IUserToken extends Omit<User, "password" | "activationCode" | "isActive" | "email" | "fullName" | "profilePicture" | "username"> {
    // typenya itu dari mongoose
    id?: Types.ObjectId
}

export const generateToken = (user: IUserToken) => {
    // ini akan generate token jwt dengan exptime 1 jam
    const token = jwt.sign(user, SECRETPASS, {
        expiresIn: "1h"
    })
    return token
}

export const getUserData = (token: string) => {
    try {
        const user = jwt.verify(token, SECRETPASS) as IUserToken
        return user;
    } catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
}