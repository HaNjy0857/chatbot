const userService = require("../services/userService");

// 新增升級用戶控制器
exports.upgradeToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await userService.upgradeToAdmin(userId);

    res.json({
      success: true,
      message: "用戶已成功升級為管理員",
      user: result.user,
      token: result.token, // 返回新的 token
    });
  } catch (error) {
    console.error("升級用戶失敗:", error);
    res.status(500).json({
      success: false,
      message: "升級用戶失敗",
      error: error.message,
    });
  }
};

// 新增降級用戶控制器
exports.downgradeToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await userService.downgradeToUser(userId);
    res.json({
      success: true,
      message: "管理員已成功降級為普通用戶",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    console.error("降級用戶失敗:", error);
    res.status(500).json({
      success: false,
      message: "降級用戶失敗",
      error: error.message,
    });
  }
};
