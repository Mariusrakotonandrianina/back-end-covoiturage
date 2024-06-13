const Secteur = require("../model/Secteur.js");
const Route = require("../model/Route.js");

exports.createSecteur = async (req, res) => {
  try {
    const { nomSecteur, categorie, saturation, jmarche, rondPoint, autre } =
      req.body;
    if (
      !nomSecteur ||
      !categorie ||
      !saturation ||
      !jmarche ||
      !rondPoint ||
      !autre
    ) {
      return res.status(400).json({ message: "champs obligatoire" });
    }

    const latestSecteur = await Secteur.findOne(
      {},
      {},
      { sort: { codeSecteur: -1 } }
    );

    let countSecteurs = 0;
    if (latestSecteur) {
      countSecteurs = parseInt(latestSecteur.codeSecteur.slice(1)) + 1;
    }

    const codeSecteur = `S${("000" + countSecteurs).slice(-4)}`;

    const existingSecteur = await Secteur.findOne({ codeSecteur });
    if (existingSecteur) {
      return res.status(400).json({ message: "Secteur déjà existant" });
    }

    const newSecteur = await Secteur.create({
      codeSecteur,
      nomSecteur,
      categorie,
      saturation,
      jmarche,
      rondPoint,
      autre,
    });
    res.status(200).json({ newSecteur });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "insertion echoué!!!" });
  }
};

exports.getSecteur = async (req, res) => {
  try {
    const secteur = await Secteur.find();
    res.status(200).json(secteur);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "récupération échoué" });
  }
};

exports.deleteSecteur = async (req, res) => {
  try {
    const secteur = await Secteur.findByIdAndDelete(req.params.id);
    res.status(200).json({ secteur });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la secteur" });
  }
};

exports.updSecteur = async (req, res) => {
  try {
    const { nomSecteur, categorie, saturation, jmarche, rondPoint, autre } =
      req.body;
    const updFields = {
      nomSecteur,
      categorie,
      saturation,
      jmarche,
      rondPoint,
      autre,
    };

    const secteur = await Secteur.findByIdAndUpdate(
      req.params.id,
      {
        $set: updFields,
      },
      {
        new: true,
      }
    );

    res.status(200).json({ secteur });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de le mise à jours de secteur" });
  }
};

exports.searchSecteur = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({ message: "Terme de recherche manquant" });
    }

    const regex = new RegExp(searchTerm, "i");

    const secteurs = await Secteur.find({
      $or: [
        { codeSecteur: regex },
        { nomSecteur: regex },
        { categorie: regex },
        { saturation: regex },
        { jmarche: regex },
        { autre: regex },
      ],
    });

    res.status(200).json(secteurs);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la recherche des secteurs" });
  }
};

exports.checkSecteurUsage = async (req, res) => {
  try {
    const secteurId = req.params.id;
    const routeCount = await Route.countDocuments({
      $or: [
        { primus: secteurId },
        { terminus: secteurId },
        { passage: secteurId },
      ],
    });
    res.status(200).json({ usage: routeCount > 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la vérification de l'utilisation du secteur" });
  }
};