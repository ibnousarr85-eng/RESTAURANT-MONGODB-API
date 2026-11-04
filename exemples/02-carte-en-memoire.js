const express = require("express");

const app = express();
app.use(express.json()); // lit le corps JSON des requêtes

const plats = [
  { code: "P01", nom: "Thiéboudienne", prix: 3500 },
  { code: "P02", nom: "Yassa poulet", prix: 3000 },
  { code: "P17", nom: "Bissap", prix: 500 },
];

// GET /plats?prixMax=3000
app.get("/plats", (req, res) => {
  const prixMax = Number(req.query.prixMax);
  const resultat = Number.isNaN(prixMax)
    ? plats
    : plats.filter((p) => p.prix <= prixMax);
  res.json(resultat);
});

// GET /plats/P01
app.get("/plats/:code", (req, res) => {
  const plat = plats.find((p) => p.code === req.params.code);
  if (!plat)
    return res.status(404).json({ erreur: "Plat introuvable" });
  res.json(plat);
});

// POST /plats
// corps : { "code": "P21", "nom": "Ndambé", "prix": 1000 }
app.post("/plats", (req, res) => {
  const { code, nom, prix } = req.body;
  if (!code || !nom || typeof prix !== "number") {
    return res
      .status(400)
      .json({
        erreur: "code, nom et prix (nombre) sont obligatoires",
      });
  }
  const plat = { code, nom, prix };
  plats.push(plat);
  res.status(201).json(plat);
});

app.listen(3001, () =>
  console.log("Carte en mémoire sur http://localhost:3001/plats"),
);
