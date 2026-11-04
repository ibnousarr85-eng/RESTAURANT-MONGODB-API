const express = require("express");
const {
  chiffreAffaires,
  topPlats,
} = require("../controllers/statsController");

const router = express.Router();

router.get("/chiffre-affaires", chiffreAffaires);
router.get("/top-plats", topPlats);

module.exports = router;
