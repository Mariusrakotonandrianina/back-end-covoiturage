const mongoose = require("mongoose");
const Trajet = require("../model/Trajet.js");
const Conducteur = require("../model/Conducteur.js");
const Vehicule = require("../model/Vehicule.js");
const BusCoop = require("../model/BusCooperative.js");
const BusReg = require("../model/BusRegistre.js");

exports.createTrajet = async (req, res) => {
  try {
    const { cooperative, immatriculation, dateTrajet, heureDepart, frais } = req.body;
    if (!cooperative) {
      return res
        .status(400)
        .json({ message: "Le champ 'busCoop' est obligatoire" });
    }
    if (!immatriculation) {
      return res
        .status(400)
        .json({ message: "Le champ 'immatriculation' est obligatoire" });
    }
    if (!dateTrajet) {
      return res
        .status(400)
        .json({ message: "Le champ 'dateTrajet' est obligatoire" });
    }
    if (!heureDepart) {
      return res
        .status(400)
        .json({ message: "Le champ 'heureTrajet' est obligatoire" });
    }

    if (!frais) {
      return res
        .status(400)
        .json({ message: "Le champ 'frais' est obligatoire" });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateTrajet)) {
      return res
        .status(400)
        .json({ message: "Le format de la date doit être 'yyyy-mm-aa'" });
    }

    const vehicule = await Vehicule.findOne({ immatriculation });

    if (!vehicule) {
      return res.status(404).json({
        message: "Le véhicule correspondant à l'immatriculation n'existe pas",
      });
    }

    const busReg = await BusReg.findOne({ bus: vehicule._id });

    if (!busReg) {
      return res
        .status(404)
        .json({ message: "Le busReg correspondant au véhicule n'existe pas" });
    }

    const cooperatives = await BusCoop.find(
      { numCoop: { $in: cooperative } },
      "_id"
    );

    const latestTrajet = await Trajet.findOne(
      {},
      {},
      { sort: { codeTrajet: -1 } }
    );
    let countTrajet = 0;
    if (latestTrajet) {
      countTrajet = parseInt(latestTrajet.codeTrajet.slice(2)) + 1;
    }
    const codeTrajet = `TB${("000" + countTrajet).slice(-4)}`;

    const existingTrajet = await Trajet.findOne({ codeTrajet });
    if (existingTrajet) {
      return res.status(400).json({ message: "Trajet déjà existant" });
    }

    const newTrajet = await Trajet.create({
      codeTrajet,
      cooperative: cooperatives.map((cooperative) => cooperative._id),
      vehicule: busReg._id,
      dateTrajet,
      heureDepart,
      nbPlace: vehicule.nbPlace,
      frais,
    });

    res.status(200).json({ newTrajet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Insertion échouée!!!" });
  }
};

exports.getTrajet = async (req, res) => {
  try {
    const trajets = await Trajet.find()
      .populate({
        path: "cooperative",
        select: "numCoop nomCoop primus trajet terminus",
      })
      .populate({
        path: "vehicule",
        populate: [
          { path: "conducteur", select: "-motsdePasse" },
          { path: "bus" },
        ],
      })
      .sort({ dateTrajet: -1 });;

    res.status(200).json(trajets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Récupération échouée" });
  }
};

exports.deleteTrajet = async (req, res) => {
  try {
    const trajet = await Trajet.findByIdAndDelete(req.params.id);
    res.status(200).json({ trajet });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la trajet" });
  }
};

exports.updTrajet = async (req, res) => {
  try {
    const { cooperative, immatriculation, dateTrajet, heureDepart, frais } =
      req.body;

    if (!cooperative) {
      return res
        .status(400)
        .json({ message: "Le champ 'cooperative' est obligatoire" });
    }
    if (!immatriculation) {
      return res
        .status(400)
        .json({ message: "Le champ 'immatriculation' est obligatoire" });
    }
    if (!dateTrajet) {
      return res
        .status(400)
        .json({ message: "Le champ 'dateTrajet' est obligatoire" });
    }
    if (!heureDepart) {
      return res
        .status(400)
        .json({ message: "Le champ 'heureDepart' est obligatoire" });
    }
    if (!frais) {
      return res
        .status(400)
        .json({ message: "Le champ 'frais' est obligatoire" });
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateTrajet)) {
      return res
        .status(400)
        .json({ message: "Le format de la date doit être 'yyyy-mm-aa'" });
    }

    const vehicule = await Vehicule.findOne({ immatriculation });

    if (!vehicule) {
      return res.status(404).json({
        message: "Le véhicule correspondant à l'immatriculation n'existe pas",
      });
    }

    const busReg = await BusReg.findOne({ bus: vehicule._id });

    if (!busReg) {
      return res
        .status(404)
        .json({ message: "Le busReg correspondant au véhicule n'existe pas" });
    }

    const cooperatives = await BusCoop.find(
      { numCoop: { $in: cooperative } },
      "_id"
    );

    const invalidIds = [];

    const checkIds = (ids) => {
      if (!Array.isArray(ids)) {
        invalidIds.push(ids);
      }
    };

    const updFields = {
      cooperative: cooperatives.map((coop) => coop._id),
      vehicule: busReg._id,
      dateTrajet,
      heureDepart,
      frais,
    };

    const trajet = await Trajet.findByIdAndUpdate(
      req.params.id,
      { $set: updFields },
      { new: true }
    );

    res.status(200).json({ trajet });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du trajet" });
  }
};

exports.searchTrajet = async (req, res) => {
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

    let dateQuery = {};
    const parts = searchTerm.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts.map(Number);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        dateQuery = { dateTrajet: new Date(year, month - 1, day) };
      }
    } else if (parts.length === 2) {
      const [month, day] = parts.map(Number);
      if (!isNaN(month) && !isNaN(day)) {
        dateQuery = {
          $or: [
            { $expr: { $eq: [{ $month: "$dateTrajet" }, month] } },
            { $expr: { $eq: [{ $dayOfMonth: "$dateTrajet" }, day] } },
          ],
        };
      }
    } else if (parts.length === 1) {
      const year = Number(searchTerm);
      if (!isNaN(year)) {
        dateQuery = {
          $expr: {
            $eq: [{ $year: "$dateTrajet" }, year],
          },
        };
      }
    }
    const heureDepartQuery = { heureDepart: regex };

    const trajets = await Trajet.find({
      $or: [
        { codeTrajet: regex },
        { cooperative: { $in: busCoopIds } },
        { vehicule: { $in: vehiculeIds } },
        { "vehicule.conducteur": { $in: conducteurIds } },
        dateQuery,
        heureDepartQuery,
      ],
    })
      .populate({
        path: "cooperative",
        select: "numCoop nomCoop primus trajet terminus",
      })
      .populate({
        path: "vehicule",
        populate: {
          path: "bus",
          select: "numSerie immatriculation marque categorie nbPlace",
        },
      })
      .populate({
        path: "vehicule",
        populate: {
          path: "conducteur",
          select: "numCIN nom email telephone",
        },
      });

    res.status(200).json(trajets);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la recherche des enregistrements de trajet",
    });
  }
};

exports.getTrajetsDisponibles = async (req, res) => {
  try {
    const currentDate = new Date();

    const trajetsDisponibles = await Trajet.find({
      nbPlace: { $gt: 0 },
      dateTrajet: { $gte: currentDate },
    })
      .sort({ dateTrajet: 1 })
      .populate({
        path: "cooperative",
        select: "numCoop nomCoop primus trajet terminus",
      })
      .populate({
        path: "vehicule",
        populate: [
          { path: "conducteur", select: "-motsdePasse" },
          { path: "bus" },
        ],
      });

    const trajetsFiltres = trajetsDisponibles.filter((trajet) => {
      const dateDepart = new Date(trajet.dateTrajet);
      const heureDepart = parseInt(trajet.heureDepart.split(":")[0]);

      if (
        dateDepart > currentDate ||
        (dateDepart.getTime() === currentDate.getTime() &&
          heureDepart > currentDate.getHours())
      ) {
        return true;
      }
      return false;
    });

    res.status(200).json(trajetsFiltres);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Erreur lors de la récupération des trajets disponibles",
    });
  }
};
