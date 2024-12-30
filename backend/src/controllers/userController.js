exports.getAdminPage = (req, res) => {
  res.json({ message: "欢迎，管理员！" });
};

exports.getUserPage = (req, res) => {
  res.json({ message: "欢迎，用户！" });
};
