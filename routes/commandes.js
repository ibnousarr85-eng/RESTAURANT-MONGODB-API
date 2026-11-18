const express = require("express");
const ctrl = require("../controllers/commandeController");
const verifierAdmin = require("../middlewares/verifierAdmin");

const router = express.Router();

// Consultation de toutes les commandes : administrateur uniquement
router.get("/", verifierAdmin, ctrl.listerCommandes);

// Création d'une commande : publique
router.post("/", ctrl.creerCommande);

// Consultation d'une commande précise : publique
router.get("/:numero", ctrl.obtenirCommande);

// Modification du statut : administrateur uniquement
router.patch(
  "/:numero/statut",
  verifierAdmin,
  ctrl.changerStatut
);

// Suppression : administrateur uniquement
router.delete("/:numero", verifierAdmin, ctrl.supprimerCommande);

module.exports = router;
