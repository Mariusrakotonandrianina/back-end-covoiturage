const Location = require("../model/Location.js");
const ReserLocation = require("../model/ReserLocation.js");

exports.createLocation = async (req, res) => {
  try {
    const { numSerie, immatriculation, marque, frais, utilisation, nbPlace } = req.body;
    const imageVehicule = req.file.filename;

    if (!numSerie || !immatriculation || !marque || !utilisation || !nbPlace || !frais) {
      return res.status(400).json({ message: "champs obligatoire" });
    }

    const newVehicule = await Location.create({
      numSerie,
      immatriculation,
      imageVehicule,
      frais,
      marque,
      utilisation,
      dateRegistre: new Date(),
      nbPlace,
    });
    res.status(200).json({ newVehicule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l'insertion" });
  }
};

exports.getLocation = async (req, res) => {
  try {
    const location = await Location.find();
    res.status(200).json(location);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "erreur lors de récupération de vehicule" });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    res.status(200).json({ location });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la vehicule" });
  }
};

exports.updLocation = async (req, res) => {
  try {
    const { numSerie, marque, utilisation, nbPlace, frais } = req.body;

    const updFields = {
      numSerie,
      marque,
      utilisation,
      dateRegistre: new Date(),
      nbPlace,
      frais,
    };

    if (req.file) {
      updFields.imageVehicule = req.file.filename;
    }

    const location = await Location.findByIdAndUpdate(
      req.params.id,
      {
        $set: updFields,
      },
      {
        new: true,
      }
    );

    res.status(200).json({ location });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de le mise à jours" });
  }
};
exports.searchLocation = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({ message: "Terme de recherche manquant" });
    }

    const regex = new RegExp(searchTerm, "i");

    const locations = await Location.find({
      $or: [
        { numSerie: regex },
        { immatriculation: regex },
        { marque: regex },
        { utilisation: regex },
      ],
    });

    res.status(200).json(locations);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la recherche des véhicules" });
  }
};

exports.checkLocationUsage = async (req, res) => {
  try {
    const reserLocationId = req.params.id;
    const regCount = await ReserLocation.countDocuments({
      $or: [{ location: reserLocationId }],
    });
    res.status(200).json({ usage: regCount > 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la vérification de l'utilisation du vehicule",
    });
  }
};
