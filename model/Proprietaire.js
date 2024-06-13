const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const proprietaireSchema = new Schema({
  cinProp: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^[0-9]{12}$/.test(v);
      },
      message: (props) => `${props.value} n'est pas un CIN valide!`,
    },
  },
  nomProp: {
    type: String,
    required: true,
  },
  telephone: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: (props) =>
        `${props.value} n'est pas un numéro de téléphone valide!`,
    },
  },
  email: {
    type: String,
    required: true,
  },
});

const Proprietaire = mongoose.model("Proprietaire", proprietaireSchema);
module.exports = Proprietaire;
