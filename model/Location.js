const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  numSerie: {
    type: String,
    require: true,
    unique: true,
  },
  immatriculation: {
    type: String,
    required: true,
    unique: true,
  },
  imageVehicule: {
    type: String,
  },
  marque: {
    type: String,
    required: true,
  },
  frais: {
    type: Number,
    required: true,
  },
  dateRegistre: {
    type: Date,
    default: Date.now,
  },
  nbPlace: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value >= 0;
      },
      message: (props) => `${props.value} n'est pas un nombre valide.`,
    },
  },
});

const Location = mongoose.model("Location", locationSchema);
module.exports = Location;
