const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Secteur = require("./Secteur.js");
const BusCoop = require("./BusCooperative.js");

const routeSchema = new Schema({
  codeRoute: {
    type: String,
    required: true,
    unique: true,
  },
  nomRoute: {
    type: String,
    required: true,
  },
  categorieTrafic: {
    type: String,
    required: true,
  },
  primus: {
    type: Schema.Types.ObjectId,
    ref: Secteur,
    required: true,
  },
  terminus: {
    type: Schema.Types.ObjectId,
    ref: Secteur,
    required: true,
  },
  passage: [
    {
      type: Schema.Types.ObjectId,
      ref: Secteur,
      required: true,
    },
  ],
  ligneBus: {
    type: Schema.Types.ObjectId,
    ref: BusCoop,
    required: true,
  },
});

const Route = mongoose.model("Route", routeSchema);
module.exports = Route;
