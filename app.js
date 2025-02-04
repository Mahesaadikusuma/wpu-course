// INI FILE UNTUK HASH PASSWORD
// ATAU BISA DISEBUT KEY ATAU KUNCI DARI ENKRIPSI
const crypto = require("crypto");
const SECRET = crypto.randomBytes(16).toString("hex");

console.log(SECRET);
