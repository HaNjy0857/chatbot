const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticateToken, isAdmin } = require("../middleware/auth");

router.put(
  "/upgrade/:userId",
  authenticateToken,
  userController.upgradeToAdmin
);

router.put(
  "/downgrade/:userId",
  authenticateToken,
  isAdmin,
  userController.downgradeToUser
);

module.exports = router;
