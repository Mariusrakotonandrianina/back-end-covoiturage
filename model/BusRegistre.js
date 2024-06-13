const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Conducteur = require("./Conducteur.js");
const Vehicule = require("./Vehicule.js");
const BusCoop = require("./BusCooperative.js");

const busRegSchema = new Schema({
  idBus: {
    type: String,
    required: true,
    unique: true,
  },
  cooperative: {
    type: Schema.Types.ObjectId,
    ref: BusCoop,
    required: true,
  },
  bus: {
    type: Schema.Types.ObjectId,
    ref: Vehicule,
    required: true,
  },
  conducteur: {
    type: Schema.Types.ObjectId,
    ref: Conducteur,
    required: true,
  },
});

const BusReg = mongoose.model("BusReg", busRegSchema);
BusReg.setMaxListeners(20);
module.exports = BusReg;
