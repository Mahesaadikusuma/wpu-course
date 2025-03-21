import * as Yup from 'yup';
import { Request, Response } from "express";
import UserModel from '../models/user.model';
import { encrypt } from '../utils/encryption';
import { generateToken } from '../utils/jwt';
import { IReqUser } from '../middlewares/auth.middleware';


type TRegister = {
    fullName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

type TLogin = {
    identifier: string;
    password: string;
}

const registerValidateSchema = Yup.object({
    fullName: Yup.string().required(),
    username: Yup.string().required(),
    email: Yup.string().required(),
    password: Yup.string().required().min(6, "Password must be at least 6 characters")
        .test('at-least-one-uppercase-letter', 'Content at least one uppercase latter',
            (value) => {
                if (!value) return false;
                const regex = /^(?=.*[A-Z])/;
                return regex.test(value)
            }).test('at-least-one-number-letter', 'Content at least one number latter',
                (value) => {
                    if (!value) return false;
                    const regex = /^(?=.*\d)/;
                    return regex.test(value)
                }),
    confirmPassword: Yup.string().required().oneOf([Yup.ref('password'), ""], 'Passwords not match'),
})

export default {
    async register(req: Request, res: Response) {
        /**
        
        #swagger.tags = ['Auth']
        #swagger.requestBody = {
            required: true,
            schema: {
                $ref: "#/components/schemas/RegisterRequest"
            }
         }

        */
        const { fullName, username, email, password, confirmPassword } = req.body as unknown as TRegister;
        try {
            await registerValidateSchema.validate({ fullName, username, email, password, confirmPassword });

            const result = await UserModel.create({ fullName, username, email, password });
            res.status(200).json({
                message: "Success Registration",
                data: result
                // data: {
                //     fullName,
                //     username,
                //     email
                // }
            })
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
                data: null
            });
        }
    },

    async login(req: Request, res: Response) {
        /** 
        #swagger.requestBody = {
            required: true,
            schema: {
                $ref: "#/components/schemas/LoginRequest"
            }
         }
        #swagger.tags = ['Auth']
         */
        try {
            // ambil data user berdasarkan indentifier -> email atau username
            const { identifier, password, } = req.body as unknown as TLogin;
            const userByIdentifier = await UserModel.findOne({
                $or: [
                    // { email: req.body.identifier },
                    { email: identifier },
                    { username: identifier }
                ],
                isActive: true
            });
            if (!userByIdentifier) {
                return res.status(403).json({
                    message: "User not found",
                    data: null
                })
            }
            // validasi password  
            const validatePassword: boolean = encrypt(password) === userByIdentifier.password;
            if (!validatePassword) {
                return res.status(403).json({
                    message: "Password not match",
                    data: null
                })
            }

            // generate token
            const token = generateToken({
                id: userByIdentifier._id,
                role: userByIdentifier.role
            });

            return res.status(200).json({
                message: "Login Success",
                // data: userByIdentifier // ini yg lama
                data: token
            })

        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
                data: null
            });
        }
    },

    async me(req: IReqUser, res: Response) {
        /**
        #swagger.security = [{
            "bearerAuth": []
        }]
        #swagger.tags = ['Auth']
         */
        try {
            const user = req.user;
            const result = await UserModel.findById(user?.id);

            if (!result) {
                return res.status(404).json({
                    message: "User not found",
                    data: null
                })
            }

            res.status(200).json({
                message: "Success get user profile",
                data: result
            })
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
                data: null
            });
        }
    },

    async activation(req: Request, res: Response) {
        /**
        #swagger.tags = ['Auth']
        #swagger.requestBody = {
            required: true,
            schema: {
                $ref: "#/components/schemas/ActivationRequest"
            }
        }
         */
        try {
            const { code } = req.body as { code: string };
            const user = await UserModel.findOneAndUpdate(
                {
                    activationCode: code,
                },
                {
                    isActive: true,
                },
                {
                    new: true,
                })

            res.status(200).json({
                message: "Success Activation",
                data: user
            })
        } catch (error) {
            const err = error as unknown as Error;
            res.status(400).json({
                message: err.message,
                data: null
            });
        } finally {

        }
    }
}