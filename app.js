const express = require("express");
const cors = require("cors");

const logger = require("./middlewares/logger");
const routeIntrouvable = require("./middlewares/routeIntrouvable");
const gestionErreurs = require("./middlewares/gestionErreurs");
const platsRouter = require("./routes/plats");
const commandesRouter = require("./routes/commandes");
const statsRouter = require("./routes/stats");

const app = express();

// 1. Middlewares globaux : pour chaque requête, dans l'ordre
app.use(logger);
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 2. Routes
app.get("/api", (req, res) => {
  res.json({
    nom: "API du restaurant Le Baobab Gourmand",
    routes: [
      "/api/plats",
      "/api/commandes",
      "/api/stats/chiffre-affaires",
      "/api/stats/top-plats",
    ],
  });
});
app.use("/api/plats", platsRouter);
app.use("/api/commandes", commandesRouter);
app.use("/api/stats", statsRouter);

// 3. Gestion des erreurs : toujours en dernier
app.use(routeIntrouvable);
app.use(gestionErreurs);

module.exports = app;
