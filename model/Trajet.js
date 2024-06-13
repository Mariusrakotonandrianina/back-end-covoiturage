const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BusCoop = require("./BusCooperative.js");
const BusReg = require("./BusRegistre.js");

const trajetSchema = new mongoose.Schema({
  codeTrajet: {
    type: String,
    require: true,
    unique: true,
  },
  cooperative: {
    type: Schema.Types.ObjectId,
    ref: BusCoop,
    required: true,
  },
  vehicule: {
    type: Schema.Types.ObjectId,
    ref: BusReg,
    required: true,
  },
  dateTrajet: {
    type: Date,
    required: true,
  },
  heureDepart: {
    type: String,
    required: true,
  },
  nbPlace: {
    type: Number,
    required: true,
  },
  frais: {
    type: Number,
    required: true,
  }
});

const Trajet = mongoose.model("Trajet", trajetSchema);
module.exports = Trajet;
