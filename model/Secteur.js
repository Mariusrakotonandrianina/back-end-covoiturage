const mongoose = require("mongoose");

const secteurSchema = new mongoose.Schema({
  codeSecteur: {
    type: String,
    required: true,
    unique: true,
  },
  nomSecteur: {
    type: String,
    required: true,
  },
  categorie: {
    type: String,
    required: true,
  },
  saturation: {
    type: String,
    required: true,
  },
  jmarche: {
    type: String,
    required: true,
  },
  rondPoint: {
    type: Number,
    required: true,
  },
  autre: {
    type: String,
    required: true,
  },
});

const Secteur = mongoose.model("Secteur", secteurSchema);
module.exports = Secteur;
