const mongoose = require("mongoose");

const conducteurSchema = new mongoose.Schema({
  motsdePasse: {
    type: String,
    required: true,
  },
  numCIN: {
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
  nom: {
    type: String,
    required: true,
  },
  email: {
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
});

const Conducteur = mongoose.model("Conducteur", conducteurSchema);
module.exports = Conducteur;
