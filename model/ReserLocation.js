const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Location = require("./Location.js");

const reserLocationSchema = new mongoose.Schema({
  codeReser: {
    type: String,
    required: true,
    unique: true,
  },
  nom: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  location: {
    type: Schema.Types.ObjectId,
    ref: Location,
    required: true,
  },
  frais: {
    type: Number,
    required: true
  },
  utilisation: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  dateReser: {
    type: Date,
    default: Date.now,
  },
  dateReserver: {
    type: Date,
    required: true,
  },
  dateRecuperation: {
    type: Date,
    required: true
  }
});

const ReserLocation = mongoose.model("ReserLocation", reserLocationSchema);
module.exports = ReserLocation;
