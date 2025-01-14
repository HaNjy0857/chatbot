require("dotenv").config();

module.exports = {
  secret: process.env.JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN,
  algorithm: "HS256",
  issuer: process.env.JWT_ISSUER, // 这里填入你的应用程序名称
  audience: process.env.JWT_AUDIENCE, // 这里填入你的应用程序用户组或标识符
};
