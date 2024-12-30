const jwt = require("jsonwebtoken");
const { pool } = require("../config/dbConfig");
const jwtConfig = require("../config/jwtConfig");

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(
    token,
    jwtConfig.secret,
    {
      algorithms: [jwtConfig.algorithm],
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    },
    (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    }
  );
};

exports.checkRole = (role) => {
  return async (req, res, next) => {
    const [rows] = await pool.query(
      "SELECT role FROM users WHERE username = ?",
      [req.user.username]
    );
    if (rows.length > 0 && rows[0].role === role) {
      next();
    } else {
      res.sendStatus(403);
    }
  };
};
