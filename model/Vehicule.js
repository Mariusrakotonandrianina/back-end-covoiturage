const mongoose = require("mongoose");

const vehiculeSchema = new mongoose.Schema({
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
  marque: {
    type: String,
    required: true,
  },
  categorie: {
    type: String,
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

const Vehicule = mongoose.model("Vehicule", vehiculeSchema);
module.exports = Vehicule;
