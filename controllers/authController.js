const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const NOM_COOKIE = "baobab_admin_token";
const DUREE_SESSION = 8 * 60 * 60 * 1000;

function optionsCookie() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}

async function connecter(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Identifiant et mot de passe obligatoires.",
      });
    }

    if (username !== process.env.ADMIN_USERNAME) {
      return res.status(401).json({
        message: "Identifiant ou mot de passe incorrect.",
      });
    }

    const motDePasseValide = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH
    );

    if (!motDePasseValide) {
      return res.status(401).json({
        message: "Identifiant ou mot de passe incorrect.",
      });
    }

    const token = jwt.sign(
      {
        username: process.env.ADMIN_USERNAME,
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.cookie(NOM_COOKIE, token, {
      ...optionsCookie(),
      maxAge: DUREE_SESSION,
    });

    return res.json({
      message: "Connexion réussie.",
      user: {
        username: process.env.ADMIN_USERNAME,
        role: "admin",
      },
    });
  } catch (erreur) {
    next(erreur);
  }
}

function verifierSession(req, res) {
  return res.json({
    authenticated: true,
    user: req.admin,
  });
}

function deconnecter(req, res) {
  res.clearCookie(NOM_COOKIE, optionsCookie());

  return res.json({
    message: "Déconnexion réussie.",
  });
}

module.exports = {
  connecter,
  verifierSession,
  deconnecter,
};
