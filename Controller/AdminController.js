const Admin = require("../model/Admin.js");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

exports.createAdmin = async (req, res) => {
    try {
        const { motsdePasse, numCINAdmin, nomAdmin, emailAdmin, telephoneAdmin } = req.body;

        if (!nomAdmin || !emailAdmin || !motsdePasse || !numCINAdmin || !telephoneAdmin) {
            return res.status(400).json({ message: 'Veuillez fournir tous les champs nécessaires' });
        }

        const existingAdmin = await Admin.findOne({ emailAdmin });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
        }

        const hashedPwd = await bcrypt.hash(motsdePasse, 10);

        const newAdmin = await Admin.create({ motsdePasse: hashedPwd, numCINAdmin, nomAdmin, emailAdmin, telephoneAdmin });

        const token = jwt.sign({ adminId: newAdmin._id }, jwtSecret, { expiresIn: '1h' });

        res.status(201).json({ adminId: newAdmin._id, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de l/inscription' });
    }
};

exports.adminLogin = async (req, res) => {
    try {
        const { emailAdmin, motsdePasse } = req.body;
 
        if (!emailAdmin || !motsdePasse) {
            return res.status(400).json({ message: 'Veuillez fournir l\'adresse e-mail et le mot de passe' });
        }
 
        const existingAdmin = await Admin.findOne({ emailAdmin });
 
        if (!existingAdmin) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }
 
        const passwordMatch = await bcrypt.compare(motsdePasse, existingAdmin.motsdePasse);
 
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }
 
        const token = jwt.sign({ adminId: existingAdmin._id }, jwtSecret, { expiresIn: '1h' });
 
        res.status(200).json({ adminId: existingAdmin._id, token });

    } catch (error) {

        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
 };

exports.getAdmin = async (req, res) => {
    try {
        const admins = await Admin.find({}, { motsdePasse: 0 });  
        res.status(200).json(admins);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
};

exports.deleteAdmin = async (req, res) => {
    try{
        const admin = await Admin.findByIdAndDelete(req.params.id);
        res.status(200).json({ admin });
    } catch(error) {
        console.error(error);
        res
            .status(500)
            .json({message: "Erreur lors de la suppression de la conducteur"});
    }
};

exports.updAdmin = async (req, res) => {
    try {
        const { numCINAdmin, nomAdmin, emailAdmin, telephoneAdmin } = req.body;
        const updFields = {
            numCINAdmin,
            nomAdmin,
            emailAdmin,
            telephoneAdmin,
        };

        const admin = await Admin.findByIdAndUpdate(
            req.params.id,
            {
                $set: updFields,
            },
            {
                new: true,
            }
        );

        res.status(200).json({ admin });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de le mise à jours"});
    }
};