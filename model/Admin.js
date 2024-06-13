const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  motsdePasse: {
    type: String,
    required: true,
  },
  numCINAdmin: {
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
  nomAdmin: {
    type: String,
    required: true,
  },
  emailAdmin: {
    type: String,
    required: true,
  },
  telephoneAdmin: {
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

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
