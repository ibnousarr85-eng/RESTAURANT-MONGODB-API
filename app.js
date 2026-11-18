const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const logger = require("./middlewares/logger");
const routeIntrouvable = require("./middlewares/routeIntrouvable");
const gestionErreurs = require("./middlewares/gestionErreurs");

const platsRouter = require("./routes/plats");
const commandesRouter = require("./routes/commandes");
const statsRouter = require("./routes/stats");
const authRouter = require("./routes/auth");

const app = express();

app.use(logger);

const originesCors = new Set([
  process.env.FRONTEND_ORIGIN,
  ...(process.env.NODE_ENV === "production"
    ? []
    : ["http://localhost:4200", "http://127.0.0.1:4300"]),
].filter(Boolean));

console.log("Origines CORS autorisées :", [...originesCors]);

app.use(cors({
  origin: (origin, callback) => {
    callback(null, !origin || originesCors.has(origin));
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

// Routes publiques et authentification
app.get("/api", (req, res) => {
  res.json({
    nom: "API du restaurant Le Baobab Gourmand",
    routes: [
      "/api/plats",
      "/api/commandes",
      "/api/stats/chiffre-affaires",
      "/api/stats/top-plats",
      "/api/auth/login",
      "/api/auth/me",
      "/api/auth/logout",
    ],
  });
});

app.use("/api/auth", authRouter);
app.use("/api/plats", platsRouter);
app.use("/api/commandes", commandesRouter);
app.use("/api/stats", statsRouter);

// Gestion des erreurs
app.use(routeIntrouvable);
app.use(gestionErreurs);

module.exports = app;
