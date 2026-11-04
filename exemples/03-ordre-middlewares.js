const express = require("express");
const app = express();

app.use((req, res, next) => {
  console.log("1. Je passe pour toutes les requêtes");
  next(); // sans next(), la requête reste bloquée ici
});

app.get(
  "/commande",
  (req, res, next) => {
    console.log("2. Route /commande");
    next();
  },
  (req, res) => {
    console.log("3. Deuxième fonction de la même route");
    res.send("Commande reçue");
  },
);

app.use((req, res) => {
  console.log("4. Aucune route n'a répondu");
  res.status(404).send("Introuvable");
});

app.listen(3002);
