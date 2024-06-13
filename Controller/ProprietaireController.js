const Proprietaire = require("../model/Proprietaire.js");

exports.createProprietaire = async (req, res) => {
  try {
    const { cinProp, nomProp, telephone, email } = req.body;

    if (!nomProp || !email || !cinProp || !telephone) {
      return res
        .status(400)
        .json({ message: "Veuillez fournir tous les champs nécessaires" });
    }

    const existingProprietaire = await Proprietaire.findOne({ cinProp });
    if (existingProprietaire) {
      return res.status(400).json({ message: "Cet proprietaire existe déjà" });
    }

    const newProprietaire = await Proprietaire.create({
      cinProp,
      nomProp,
      email,
      telephone,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de creation" });
  }
};

exports.getProprietaire = async (req, res) => {
  try {
    const proprietaires = await Proprietaire.find();
    res.status(200).json(proprietaires);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des utilisateurs" });
  }
};

exports.deleteProprietaire = async (req, res) => {
  try {
    const proprietaire = await Proprietaire.findByIdAndDelete(req.params.id);
    res.status(200).json({ proprietaire });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la conducteur" });
  }
};

exports.updProprietaire = async (req, res) => {
  try {
    const { cinProp, nomProp, email, telephone } = req.body;
    const updFields = {
      cinProp,
      nomProp,
      email,
      telephone,
    };

    const proprietaire = await Proprietaire.findByIdAndUpdate(
      req.params.id,
      {
        $set: updFields,
      },
      {
        new: true,
      }
    );

    res.status(200).json({ proprietaire });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de le mise à jours" });
  }
};

exports.searchProprietaire = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({ message: "Terme de recherche manquant" });
    }

    const regex = new RegExp(searchTerm, "i");

    const proprietaires = await Proprietaire.find({
      $or: [
        { cinProp: regex },
        { nomProp: regex },
        { email: regex },
        { telephone: regex },
      ],
    });

    res.status(200).json(proprietaires);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la recherche des propriétaires" });
  }
};
