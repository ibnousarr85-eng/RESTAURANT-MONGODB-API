const express = require("express");
const ctrl = require("../controllers/commandeController");
const verifierCleApi = require("../middlewares/verifierCleApi");

const router = express.Router();

router.get("/", ctrl.listerCommandes);
router.post("/", verifierCleApi, ctrl.creerCommande);
router.get("/:numero", ctrl.obtenirCommande);
router.patch(
  "/:numero/statut",
  verifierCleApi,
  ctrl.changerStatut,
);
router.delete("/:numero", verifierCleApi, ctrl.supprimerCommande);

module.exports = router;
