const mongoose = require("mongoose");

const utilisateurSchema = new mongoose.Schema({
  motsdePasse: {
    type: String,
    required: true,
  },
  numCINUtil: {
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
  nomUtil: {
    type: String,
    required: true,
  },
  emailUtil: {
    type: String,
    required: true,
  },
  telephoneUtil: {
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

const Utilisateur = mongoose.model("Utilisateur", utilisateurSchema);
module.exports = Utilisateur;
