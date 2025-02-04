import crypto from "crypto";
import { SECRETPASS } from "./env";
// encrypt password

// kode ini dari AI
// export const encrypt = (password: string) => crypto.createHash("sha256").update(password).digest("hex");

export const encrypt = (password: string): string => {
    const encrypted = crypto.pbkdf2Sync(password, SECRETPASS, 10000, 64, "sha512").toString("hex");
    return encrypted;
}