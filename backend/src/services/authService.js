const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const jwtConfig = require("../config/jwtConfig");
const { Op } = require("sequelize");
const logger = require("../utils/logger");

exports.register = async (username, email, password) => {
  try {
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (existingUser) {
      const reason = existingUser.username === username ? "用戶名" : "電子郵件";
      logger.warn(`註冊失敗：${reason}已被使用`, { username, email });
      return { success: false, message: `此${reason}已被使用` };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    logger.info("新用戶註冊成功", { username, email });
    return { success: true, message: "用戶註冊成功" };
  } catch (error) {
    logger.error("註冊過程中發生錯誤", { error: error.message });
    throw error;
  }
};

exports.login = async (email, password) => {
  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      logger.warn("登入失敗：用戶不存在", { email });
      return { success: false, message: "信箱或密碼不正確" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.warn("登入失敗：密碼不正確", { email });
      return { success: false, message: "信箱或密碼不正確" };
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    logger.info("登入成功", {
      email: user.email,
      userId: user.id,
      username: user.username,
    });
    return {
      success: true,
      message: "登入成功",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    logger.error("登入過程中發生錯誤", { error: error.message });
    throw error;
  }
};

exports.generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
};
