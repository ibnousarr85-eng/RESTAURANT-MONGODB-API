const jwt = require("jsonwebtoken");

function verifierAdmin(req, res, next) {
  const token = req.cookies?.baobab_admin_token;

  if (!token) {
    return res.status(401).json({
      message: "Accès réservé à l'administrateur.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Droits administrateur requis.",
      });
    }

    req.admin = {
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch (erreur) {
    return res.status(401).json({
      message: "Session invalide ou expirée.",
    });
  }
}

module.exports = verifierAdmin;
