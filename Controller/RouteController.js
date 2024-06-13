const Route = require("../model/Route.js");
const Secteur = require("../model/Secteur.js");
const BusCoop = require("../model/BusCooperative.js");

exports.createRoute = async (req, res) => {
  try {
    const {
      codeRoute,
      nomRoute,
      categorieTrafic,
      primus,
      terminus,
      passage,
      ligneBus,
    } = req.body;
    if (
      !codeRoute ||
      !nomRoute ||
      !categorieTrafic ||
      !primus ||
      !terminus ||
      !passage ||
      !ligneBus
    ) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    const primusSecteursPromises = Array.isArray(primus)
      ? primus.map((code) => Secteur.findOne({ codeSecteur: code }))
      : [Secteur.findOne({ codeSecteur: primus })];

    const terminusSecteursPromises = Array.isArray(terminus)
      ? terminus.map((code) => Secteur.findOne({ codeSecteur: code }))
      : [Secteur.findOne({ codeSecteur: terminus })];

    const passageSecteursPromises = Array.isArray(passage)
      ? passage.map((code) => Secteur.findOne({ codeSecteur: code }))
      : [Secteur.findOne({ codeSecteur: passage })];

    const ligneBusPromises = Array.isArray(ligneBus)
      ? ligneBus.map((code) => BusCoop.findOne({ numCoop: code }))
      : [BusCoop.findOne({ numCoop: ligneBus })];

    const [
      primusSecteurs,
      terminusSecteurs,
      passageSecteurs,
      ligneBusBusCoops,
    ] = await Promise.all([
      Promise.all(primusSecteursPromises),
      Promise.all(terminusSecteursPromises),
      Promise.all(passageSecteursPromises),
      Promise.all(ligneBusPromises),
    ]);

    if (
      primusSecteurs.includes(null) ||
      terminusSecteurs.includes(null) ||
      passageSecteurs.includes(null) ||
      ligneBusBusCoops.includes(null)
    ) {
      return res
        .status(404)
        .json({ message: "Certains secteurs n'existent pas" });
    }

    const existingRoute = await Route.findOne({ codeRoute });
    if (existingRoute) {
      return res.status(400).json({ message: "Route déjà existante" });
    }

    const newRoute = await Route.create({
      codeRoute,
      nomRoute,
      categorieTrafic,
      primus: primusSecteurs.map((secteur) => secteur._id),
      terminus: terminusSecteurs.map((secteur) => secteur._id),
      passage: passageSecteurs.map((secteur) => secteur._id),
      ligneBus: ligneBusBusCoops.map((busCoop) => busCoop._id),
    });

    res.status(200).json({ newRoute });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Insertion échouée!!!" });
  }
};

exports.updRoute = async (req, res) => {
  try {
    const { codeRoute, nomRoute, categorieTrafic, primus, terminus } = req.body;
    const updFields = {
      codeRoute,
      nomRoute,
      categorieTrafic,
      primus,
      terminus,
    };

    const [primusSecteur, terminusSecteur] = await Promise.all([
      Secteur.findOne({ codeSecteur: primus }),
      Secteur.findOne({ codeSecteur: terminus }),
    ]);

    if (!primusSecteur || !terminusSecteur) {
      return res
        .status(404)
        .json({ message: "Certains secteurs n'existent pas" });
    }

    updFields.primus = primusSecteur._id;
    updFields.terminus = terminusSecteur._id;

    const route = await Route.findByIdAndUpdate(
      req.params.id,
      { $set: updFields },
      { new: true }
    );

    res.status(200).json({ route });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise a jour de la route" });
  }
};

exports.getRoute = async (req, res) => {
  try {
    const routes = await Route.find()
      .populate('primus')
      .populate('terminus')
      .populate('passage')
      .populate('ligneBus');

    res.status(200).json(routes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la récupération des routes" });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    res.status(200).json({ route });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de le suppression de la route" });
  }
};

exports.searchRoute = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({ message: "Terme de recherche manquant" });
    }

    const regex = new RegExp(searchTerm, "i");

    const secteurIds = await Secteur.find(
      {
        $or: [
          { codeSecteur: regex },
          { nomSecteur: regex },
          { categorie: regex },
          { saturation: regex },
          { jmarche: regex },
          { autre: regex }
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

    const routes = await Route.find({
      $or: [
        { codeRoute: regex },
        { nomRoute: regex },
        { categorieTrafic: regex },
        { primus: { $in: secteurIds } },
        { terminus: { $in: secteurIds } },
        { ligneBus: { $in: busCoopIds } },
        { passage: { $in: secteurIds } }
      ],
    })
      .populate("ligneBus", "numCoop nomCoop primus trajet terminus")
      .populate("primus", "codeSecteur nomSecteur categorie saturation jmarche rondPoint autre")
      .populate("terminus", "codeSecteur nomSecteur categorie saturation jmarche rondPoint autre")
      .populate("passage", "codeSecteur nomSecteur categorie saturation jmarche rondPoint autre");

    res.status(200).json(routes);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        message: "Erreur lors de la recherche des ",
      });
  }
};
