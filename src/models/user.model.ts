import mongoose from "mongoose";
import { encrypt } from "../utils/encryption";
import { sendMail, renderMainHtml } from "../utils/mail/mail"
import { CLIENT_HOST, EMAIL_SMTP_USER } from "../utils/env";


export interface User {
    fullName: string;
    username: string;
    email: string;
    password: string;
    role: string;
    profilePicture: string;
    isActive: boolean;
    activationCode: string;
    createdAt?: string;
}

const Schema = mongoose.Schema;
const userSchema = new Schema<User>({
    fullName: {
        type: Schema.Types.String,
        required: true
    },
    username: {
        type: Schema.Types.String,
        unique: true,
        required: true
    },
    email: {
        type: Schema.Types.String,
        unique: true,
        required: true
    },
    password: {
        type: Schema.Types.String,
        required: true
    },
    role: {
        type: Schema.Types.String,
        enum: ["admin", "user"],
        default: "user"
    },
    profilePicture: {
        type: Schema.Types.String,
        default: "user.jpg"
    },
    isActive: {
        type: Schema.Types.Boolean,
        default: false
    },
    activationCode: {
        type: Schema.Types.String
    }
}, {
    timestamps: true
})

// ini middleware
userSchema.pre("save", function (next) {
    // jadi this itu akan mengambil semua data dari user / struktur data dari user
    const user = this;
    user.password = encrypt(user.password);
    user.activationCode = encrypt(user.id);
    next();
})

// ini untuk mengirimkan email activation / email verify
userSchema.post('save', async function (doc, next) {
    try {
        const user = doc;
        console.log("send email to ", user);
        const contentMail = await renderMainHtml('registrationSuccess.ejs', {
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            createdAt: user.createdAt,
            activationLink: `${CLIENT_HOST}/auth/activation?code=${user.activationCode}`
        })



        await sendMail({
            from: EMAIL_SMTP_USER,
            to: user.email,
            subject: "Aktivasi Akun Anda di web Acara",
            html: contentMail,
        });
        next();
    } catch (error) {
        console.log(error);
    } finally {
        next();
    }
})


userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
}


const UserModel = mongoose.model<User>("User", userSchema);

export default UserModel;