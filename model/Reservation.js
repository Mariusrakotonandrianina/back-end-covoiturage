const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Trajet = require("./Trajet.js");

const reservationSchema = new mongoose.Schema({
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
  trajet: {
    type: Schema.Types.ObjectId,
    ref: Trajet,
    required: true,
  },
  frais: {
    type: Number,
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
  nbPlaceReserver: {
    type: Number,
    required: true,
  },
  fraisPayer: {
    type: Number,
    required: true,
  },
  numPlace: {
    type: [Number],
    required: true
  },
  immatriculation: {
    type: String,
    required: true,
  }
});

const Reservation = mongoose.model("Reservation", reservationSchema);
module.exports = Reservation;
