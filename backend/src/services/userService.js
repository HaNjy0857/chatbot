const db = require("../models");
const User = db.User;
const authService = require("./authService");

class UserService {
  async upgradeToAdmin(userId) {
    try {
      // 使用 Sequelize 更新用戶角色
      const result = await User.update(
        { role: "admin" },
        {
          where: { id: userId },
        }
      );

      if (result[0] === 0) {
        throw new Error("用戶不存在");
      }

      // 獲取更新後的用戶資料
      const updatedUser = await User.findByPk(userId);
      if (!updatedUser) {
        throw new Error("無法獲取更新後的用戶資料");
      }

      // 使用 authService 生成新的 token
      const newToken = authService.generateToken(updatedUser);

      return {
        user: updatedUser,
        token: newToken,
      };
    } catch (error) {
      throw new Error(`升級用戶失敗: ${error.message}`);
    }
  }

  async downgradeToUser(userId) {
    try {
      // 使用 Sequelize 更新用戶角色
      const result = await User.update(
        { role: "user" },
        {
          where: { id: userId },
        }
      );

      if (result[0] === 0) {
        throw new Error("用戶不存在");
      }

      // 獲取更新後的用戶資料
      const updatedUser = await User.findByPk(userId);
      if (!updatedUser) {
        throw new Error("無法獲取更新後的用戶資料");
      }

      const newToken = authService.generateToken(updatedUser);
      return {
        user: updatedUser,
        token: newToken,
      };
    } catch (error) {
      throw new Error(`降級用戶失敗: ${error.message}`);
    }
  }
}

module.exports = new UserService();
