const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticateToken, checkRole } = require("../middleware/auth");

router.get(
  "/admin",
  authenticateToken,
  checkRole("admin"),
  userController.getAdminPage
);
router.get("/user", authenticateToken, userController.getUserPage);

module.exports = router;
