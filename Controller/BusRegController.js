const BusReg = require("../model/BusRegistre.js");
const Conducteur = require("../model/Conducteur.js");
const Vehicule = require("../model/Vehicule.js");
const BusCoop = require("../model/BusCooperative.js");

exports.createBusReg = async (req, res) => {
  try {
    const { bus, conducteur, cooperative } = req.body;
    if (!bus) {
      return res
        .status(400)
        .json({ message: "Le champ 'bus' est obligatoire" });
    }
    if (!conducteur) {
      return res
        .status(400)
        .json({ message: "Le champ 'conducteur' est obligatoire" });
    }
    if (!cooperative) {
      return res
        .status(400)
        .json({ message: "Le champ 'cooperative' est obligatoire" });
    }

    const vehicules = await Vehicule.find(
      { immatriculation: { $in: bus } },
      "_id"
    );
    const conducteurs = await Conducteur.find(
      { numCIN: { $in: conducteur } },
      "_id"
    );
    const cooperatives = await BusCoop.find(
      { numCoop: { $in: cooperative } },
      "_id"
    );

    // Vérifier chaque identifiant récupéré
    const invalidIds = [];
    const checkIds = (ids) => {
      ids.forEach((id) => {
        if (!id) {
          invalidIds.push(id);
        }
      });
    };

    checkIds(vehicules);
    checkIds(conducteurs);
    checkIds(cooperatives);

    if (invalidIds.length > 0) {
      return res
        .status(404)
        .json({ message: "Certains identifiants n'existent pas" });
    }

    const latestBus = await BusReg.findOne({}, {}, { sort: { idBus: -1 } });
    let countBusRegs = 0;
    if (latestBus) {
      countBusRegs = parseInt(latestBus.idBus.slice(1)) + 1;
    }
    const idBus = `B${("000" + countBusRegs).slice(-4)}`;

    const existingBusReg = await BusReg.findOne({ idBus });
    if (existingBusReg) {
      return res.status(400).json({ message: "Bus reg déjà existante" });
    }

    const newBusReg = await BusReg.create({
      idBus,
      bus: vehicules.map((vehicule) => vehicule._id),
      conducteur: conducteurs.map((conducteur) => conducteur._id),
      cooperative: cooperatives.map((coop) => coop._id),
    });

    res.status(200).json({ newBusReg });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Insertion échouée!!!" });
  }
};

exports.getBusReg = async (req, res) => {
  try {
    const busReg = await BusReg.find().populate("bus conducteur cooperative");
    res.status(200).json(busReg);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Récupération échouée" });
  }
};

exports.deleteBusReg = async (req, res) => {
  try {
    const busReg = await BusReg.findByIdAndDelete(req.params.id);
    res.status(200).json({ busReg });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la coopérative" });
  }
};

exports.updBusReg = async (req, res) => {
  try {
    const { bus, conducteur, cooperative } = req.body;

    if (!bus) {
      return res
        .status(400)
        .json({ message: "Le champ 'bus' est obligatoire" });
    }
    if (!conducteur) {
      return res
        .status(400)
        .json({ message: "Le champ 'conducteur' est obligatoire" });
    }
    if (!cooperative) {
      return res
        .status(400)
        .json({ message: "Le champ 'cooperative' est obligatoire" });
    }

    const vehicules = await Vehicule.find(
      { immatriculation: { $in: bus } },
      "_id"
    );
    const conducteurs = await Conducteur.find(
      { numCIN: { $in: conducteur } },
      "_id"
    );
    const cooperatives = await BusCoop.find(
      { numCoop: { $in: cooperative } },
      "_id"
    );

    const invalidIds = [];
    const checkIds = (ids) => {
      ids.forEach((id) => {
        if (!id) {
          invalidIds.push(id);
        }
      });
    };

    checkIds(vehicules);
    checkIds(conducteurs);
    checkIds(cooperatives);

    if (invalidIds.length > 0) {
      return res
        .status(404)
        .json({ message: "Certains identifiants n'existent pas" });
    }

    const updFields = {
      bus: vehicules.map((vehicule) => vehicule._id),
      conducteur: conducteurs.map((conducteur) => conducteur._id),
      cooperative: cooperatives.map((coop) => coop._id),
    };

    const busReg = await BusReg.findByIdAndUpdate(
      req.params.id,
      { $set: updFields },
      { new: true }
    );

    res.status(200).json({ busReg });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de BusReg" });
  }
};

exports.searchBusReg = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({ message: "Terme de recherche manquant" });
    }

    const regex = new RegExp(searchTerm, "i");

    const vehiculeIds = await Vehicule.find(
      {
        $or: [
          { numSerie: regex },
          { immatriculation: regex },
          { marque: regex },
          { categorie: regex },
        ],
      },
      "_id"
    );

    const conducteurIds = await Conducteur.find(
      {
        $or: [
          { numCIN: regex },
          { nom: regex },
          { email: regex },
          { telephone: regex },
        ],
      },
      "_id"
    );

    const busCoopIds = await BusCoop.find(
      {
        $or: [
          { numCoop: regex },
          { nomCoop: regex },
          { primus: regex },
          { trajet: regex },
          { terminus: regex },
        ],
      },
      "_id"
    );

    const busRegs = await BusReg.find({
      $or: [
        { idBus: regex },
        { cooperative: { $in: busCoopIds } },
        { bus: { $in: vehiculeIds } },
        { conducteur: { $in: conducteurIds } },
      ],
    })
      .populate("cooperative", "numCoop nomCoop primus trajet terminus")
      .populate("bus", "numSerie immatriculation marque categorie")
      .populate("conducteur", "numCIN nom email telephone");

    res.status(200).json(busRegs);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Erreur lors de la recherche des enregistrements de bus",
      });
  }
};
