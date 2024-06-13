const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const busCoopSchema = new Schema({
  numCoop: {
    type: String,
    required: true,
    unique: true,
  },
  nomCoop: {
    type: String,
  },
  primus: {
    type: String,
  },
  trajet: {
    type: String,
  },
  terminus: {
    type: String,
  },
});

const BusCoop = mongoose.model("BusCoop", busCoopSchema);
module.exports = BusCoop;
