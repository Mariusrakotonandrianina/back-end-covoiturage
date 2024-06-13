const Conducteur = require("../model/Conducteur.js");
const BusReg = require("../model/BusRegistre.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET;

exports.createConducteur = async (req, res) => {
  try {
    const { motsdePasse, numCIN, nom, email, telephone } = req.body;

    if (!nom || !email || !motsdePasse || !numCIN || !telephone) {
      return res
        .status(400)
        .json({ message: "Veuillez fournir tous les champs nécessaires" });
    }

    const existingConducteur = await Conducteur.findOne({ email });
    if (existingConducteur) {
      return res.status(400).json({ message: "Cet utilisateur existe déjà" });
    }

    const hashedPwd = await bcrypt.hash(motsdePasse, 10);

    const newConducteur = await Conducteur.create({
      motsdePasse: hashedPwd,
      numCIN,
      nom,
      email,
      telephone,
    });

    const token = jwt.sign({ conducteurId: newConducteur._id }, jwtSecret, {
      expiresIn: "1h",
    });

    res.status(201).json({ conducteurId: newConducteur._id, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l/inscription" });
  }
};

exports.conducteurLogin = async (req, res) => {
  try {
    const { email, motsdePasse } = req.body;

    if (!email || !motsdePasse) {
      return res.status(400).json({
        message: "Veuillez fournir l'adresse e-mail et le mot de passe",
      });
    }

    const existingConducteur = await Conducteur.findOne({ email });

    if (!existingConducteur) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const passwordMatch = await bcrypt.compare(
      motsdePasse,
      existingConducteur.motsdePasse
    );

    if (!passwordMatch) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const token = jwt.sign(
      { conducteurId: existingConducteur._id },
      jwtSecret,
      { expiresIn: "1h" }
    );

    res.status(200).json({ conducteurId: existingConducteur._id, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};

exports.getConducteur = async (req, res) => {
  try {
    const conducteurs = await Conducteur.find({}, { motsdePasse: 0 });
    res.status(200).json(conducteurs);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des utilisateurs" });
  }
};

exports.deleteConducteur = async (req, res) => {
  try {
    const conducteur = await Conducteur.findByIdAndDelete(req.params.id);
    res.status(200).json({ conducteur });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la conducteur" });
  }
};

exports.updConducteur = async (req, res) => {
  try {
    const { numCIN, nom, email, telephone } = req.body;
    const updFields = {
      numCIN,
      nom,
      email,
      telephone,
    };

    const conducteur = await Conducteur.findByIdAndUpdate(
      req.params.id,
      {
        $set: updFields,
      },
      {
        new: true,
      }
    );

    res.status(200).json({ conducteur });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de le mise à jours" });
  }
};

exports.searchConducteur = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({ message: "Terme de recherche manquant" });
    }

    const regex = new RegExp(searchTerm, "i");

    const conducteurs = await Conducteur.find({
      $or: [
        { numCIN: regex },
        { nom: regex },
        { email: regex },
        { telephone: regex },
      ],
    });

    res.status(200).json(conducteurs);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la recherche des conducteurs" });
  }
};

exports.checkConducteurUsage = async (req, res) => {
  try {
    const busRegId = req.params.id;
    const conducteurCount = await BusReg.countDocuments({
      $or: [
        { conducteur: busRegId },
      ],
    });
    res.status(200).json({ usage: conducteurCount > 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la vérification de l'utilisation du conducteur" });
  }
};

