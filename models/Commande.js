const mongoose = require("mongoose");

const ligneSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    nom: { type: String, required: true },
    categorie: { type: String, required: true },
    prixUnitaire: { type: Number, required: true, min: 0 },
    quantite: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const commandeSchema = new mongoose.Schema(
  {
    numero: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
    type: {
      type: String,
      required: [true, "Le type de commande est obligatoire"],
      enum: {
        values: ["Sur place", "À emporter", "Livraison"],
        message: "Type inconnu : {VALUE}",
      },
    },
    client: {
      prenom: {
        type: String,
        required: [true, "Le prénom du client est obligatoire"],
        trim: true,
      },
      nom: {
        type: String,
        required: [true, "Le nom du client est obligatoire"],
        trim: true,
      },
    },
    serveur: {
      type: String,
      required: [true, "Le serveur est obligatoire"],
    },
    plats: {
      type: [ligneSchema],
      validate: [
        (lignes) => lignes.length > 0,
        "Une commande contient au moins un plat",
      ],
    },
    total: { type: Number, required: true, min: 0 },
    statut: {
      type: String,
      enum: {
        values: ["Payée", "En cours", "Annulée"],
        message: "Statut inconnu : {VALUE}",
      },
      default: "En cours",
    },
    table: { type: Number, min: 1 },
    nbCouverts: { type: Number, min: 1 },
    livraison: { quartier: String, frais: Number },
    modePaiement: {
      type: String,
      enum: ["Espèces", "Wave", "Orange Money", "Carte bancaire"],
    },
    note: { type: Number, min: 1, max: 5 },
    commentaire: String,
  },
  { versionKey: false },
);

module.exports = mongoose.model("Commande", commandeSchema);
