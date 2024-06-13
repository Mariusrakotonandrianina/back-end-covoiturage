const Vehicule = require("../model/Vehicule.js");
const BusReg = require("../model/BusRegistre.js");

exports.createVehicule = async (req, res) => {
  try {
    const { numSerie, immatriculation, marque, categorie, nbPlace } = req.body;
    if (!numSerie || !immatriculation || !marque || !categorie || !nbPlace) {
      return res.status(400).json({ message: "champs obligatoire" });
    }

    const newVehicule = await Vehicule.create({
      numSerie,
      immatriculation,
      marque,
      categorie,
      dateRegistre: new Date(),
      nbPlace,
    });
    res.status(200).json({ newVehicule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'insertion" });
  }
};

exports.getVehicule = async (req, res) => {
  try {
    const vehicule = await Vehicule.find();
    res.status(200).json(vehicule);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "erreur lors de récupération de vehicule" });
  }
};

exports.deleteVehicule = async (req, res) => {
  try {
    const vehicule = await Vehicule.findByIdAndDelete(req.params.id);
    res.status(200).json({ vehicule });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la vehicule" });
  }
};

exports.updVehicule = async (req, res) => {
  try {
    const { numSerie, marque, categorie, nbPlace } = req.body;

    const updFields = {
      numSerie,
      marque,
      categorie,
      dateRegistre: new Date(),
      nbPlace,
    };

    const vehicule = await Vehicule.findByIdAndUpdate(
      req.params.id,
      {
        $set: updFields,
      },
      {
        new: true,
      }
    );

    res.status(200).json({ vehicule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de le mise à jours" });
  }
};
exports.searchVehicule = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({ message: "Terme de recherche manquant" });
    }

    const regex = new RegExp(searchTerm, "i");

    const vehicules = await Vehicule.find({
      $or: [
        { numSerie: regex },
        { immatriculation: regex },
        { marque: regex },
        { categorie: regex },
      ],
    });

    res.status(200).json(vehicules);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la recherche des véhicules" });
  }
};

exports.checkVehiculeUsage = async (req, res) => {
  try {
    const busRegId = req.params.id;
    const regCount = await BusReg.countDocuments({
      $or: [
        { bus: busRegId },
      ],
    });
    res.status(200).json({ usage: regCount > 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la vérification de l'utilisation du vehicule" });
  }
};
