const BusCoop = require("../model/BusCooperative.js");
const Route = require("../model/Route.js");
const BusReg = require("../model/BusRegistre.js");

exports.createBusCoop = async (req, res) => {
  try {
    const { numCoop, nomCoop, primus, trajet, terminus } = req.body;
    if (!numCoop || !nomCoop || !primus || !terminus || !trajet) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    const existingBusCoop = await BusCoop.findOne({ numCoop });
    if (existingBusCoop) {
      return res.status(400).json({ message: "Cooperative déjà existante" });
    }

    const newBusCoop = await BusCoop.create({
      numCoop,
      nomCoop,
      primus,
      trajet,
      terminus,
    });

    res.status(200).json({ newBusCoop });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Insertion échouée!!!" });
  }
};

exports.getBusCoop = async (req, res) => {
  try {
    const busCoop = await BusCoop.find().populate("primus terminus");
    res.status(200).json(busCoop);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Récupération échouée" });
  }
};

exports.deleteBusCoop = async (req, res) => {
  try {
    const busCoop = await BusCoop.findByIdAndDelete(req.params.id);
    res.status(200).json({ busCoop });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la coopérative" });
  }
};

exports.updBusCoop = async (req, res) => {
  try {
    const { nomCoop, primus, trajet, terminus } = req.body;

    const updFields = {
      nomCoop,
      primus,
      trajet,
      terminus,
    };

    const busCoop = await BusCoop.findByIdAndUpdate(
      req.params.id,
      { $set: updFields },
      { new: true }
    );

    res.status(200).json({ busCoop });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de BusCoop" });
  }
};

exports.searchBusCoop = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({ message: "Terme de recherche manquant" });
    }

    const regex = new RegExp(searchTerm, "i");

    const busCoop = await BusCoop.find({
      $or: [
        { numCoop: { $regex: regex } },
        { nomCoop: { $regex: regex } },
        { primus: { $regex: regex } },
        { trajet: { $regex: regex } },
        { terminus: { $regex: regex } },
      ],
    });

    res.status(200).json(busCoop);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la recherche des bus coopératives" });
  }
};

exports.checkCooperativeUsage = async (req, res) => {
  try {
    const busCoopIdId = req.params.id;
    const routeCount = await Route.countDocuments({
      $or: [{ ligneBus: busCoopIdId }],
    });
    const regCount = await BusReg.countDocuments({
      $or: [{ cooperative: busCoopIdId }],
    });
    res.status(200).json({ usage: routeCount > 0 || regCount > 0 });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Erreur lors de la vérification de l'utilisation du secteur",
      });
  }
};

module.export = {
  
}