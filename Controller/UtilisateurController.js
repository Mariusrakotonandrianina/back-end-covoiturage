const Utilisateur = require("../model/Utilisateur.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET;

exports.createUtilisateur = async (req, res) => {
  try {
    const { motsdePasse, numCINUtil, nomUtil, emailUtil, telephoneUtil } =
      req.body;

    if (
      !nomUtil ||
      !emailUtil ||
      !motsdePasse ||
      !numCINUtil ||
      !telephoneUtil
    ) {
      return res
        .status(400)
        .json({ message: "Veuillez fournir tous les champs nécessaires" });
    }

    const existingUtilisateur = await Utilisateur.findOne({ emailUtil });
    if (existingUtilisateur) {
      return res.status(400).json({ message: "Cet utilisateur existe déjà" });
    }

    const hashedPwd = await bcrypt.hash(motsdePasse, 10);

    const newUtilisateur = await Utilisateur.create({
      motsdePasse: hashedPwd,
      numCINUtil,
      nomUtil,
      emailUtil,
      telephoneUtil,
    });

    const token = jwt.sign({ utilisateurId: newUtilisateur._id }, jwtSecret, {
      expiresIn: "1h",
    });

    res.status(201).json({ utilisateurId: newUtilisateur._id, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de l/inscription" });
  }
};

exports.utilisateurLogin = async (req, res) => {
  try {
    const { emailUtil, motsdePasse } = req.body;

    if (!emailUtil || !motsdePasse) {
      return res.status(400).json({
        message: "Veuillez fournir l'adresse e-mail et le mot de passe",
      });
    }

    const existingUtilisateur = await Utilisateur.findOne({ emailUtil });

    if (!existingUtilisateur) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const passwordMatch = await bcrypt.compare(
      motsdePasse,
      existingUtilisateur.motsdePasse
    );

    if (!passwordMatch) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const token = jwt.sign(
      { utilisateurId: existingUtilisateur._id },
      jwtSecret,
      { expiresIn: "1h" }
    );

    const response = {
      utilisateur: {
        emailUtil: existingUtilisateur.emailUtil,
        nomUtil: existingUtilisateur.nomUtil,
        telephoneUtil: existingUtilisateur.telephoneUtil
      },
      token,
    };

    res.status(200).json(response);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};

exports.getUtilisateur = async (req, res) => {
  try {
    const utilisateurs = await Utilisateur.find({}, { motsdePasse: 0 });
    res.status(200).json(utilisateurs);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des utilisateurs" });
  }
};

exports.deleteUtilisateur = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByIdAndDelete(req.params.id);
    res.status(200).json({ utilisateur });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de la conducteur" });
  }
};

exports.updUtilisateur = async (req, res) => {
  try {
    const { numCINUtil, nomUtil, emailUtil, telephoneUtil } = req.body;
    const updFields = {
      numCINUtil,
      nomUtil,
      emailUtil,
      telephoneUtil,
    };

    const utilisateur = await Utilisateur.findByIdAndUpdate(
      req.params.id,
      {
        $set: updFields,
      },
      {
        new: true,
      }
    );

    res.status(200).json({ utilisateur });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur lors de le mise à jours" });
  }
};

exports.searchUtilisateur = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({ message: "Terme de recherche manquant" });
    }

    const regex = new RegExp(searchTerm, "i");

    const utilisateurs = await Utilisateur.find({
      $or: [
        { numCINUtil: regex },
        { nomUtil: regex },
        { emailUtil: regex },
        { telephoneUtil: regex },
      ],
    });

    res.status(200).json(utilisateurs);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erreur lors de la recherche des utilisateurs" });
  }
};
