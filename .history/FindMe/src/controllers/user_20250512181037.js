
const { User } = require('../models/user');
const { Roles } = require('../models/roles');
const { User_statuses } = require('../models/user_statuses');

const bcrypt = require('bcrypt');

// Créer un utilisateur       
const createUser = async (req, res) => {
    try {
        const filter = { email: req.body.data.email };
        const findUserBeforeSave = await User.find(filter).populate('role_id').populate('status_id');;
        if (findUserBeforeSave.length > 0) {
            res.status(409).send({ data: { message: "Utilisateur déjà existant !" } });
        }
        const user = new User(req.body.data);
        const userSave = await user.save();
        res.status(201).send({ status: 200, data: userSave, message: "Utilisateur enregistré avec succès !" });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};

// Obtenir tous les utilisateurs
const getUserByCriteria = async (req, res) => {

    const filter = { isDeleted: false };
    if (req.body.data?.email) {
        filter.email = { $regex: req.body.data.email, $options: "i" };
    }

    const startDate = req.body.data?.createdAt?.startDate ?? null;
    const endDate = req.body.data?.createdAt?.endDate ?? null;
    if (startDate && endDate) {
        const inputDateStart = req.body.data.createdAt.startDate;
        const inputDateEnd = req.body.data.createdAt.endDate;
        const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

        if (!regex.test(inputDateStart) || !regex.test(inputDateEnd)) {
            return res.status(400).json({ error: "Le format de date doit être jj/MM/YYYY." });
        }

        // Transformation de la date en format ISO
        const [day, month, year] = inputDateStart.split('/');
        const [dayEnd, monthEnd, yearEnd] = inputDateEnd.split('/');

        const formattedDate = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
        const formattedDateEnd = new Date(`${yearEnd}-${monthEnd}-${dayEnd}T00:00:00.000Z`);


        filter.createdAt = {
            $gte: formattedDate,
            $lte: formattedDateEnd
        };
    }

    const index = req.body.index || 0;
    const size = req.body.size || 10;
    try {
        console.log(filter)
        const findAllUser = await User.find(filter).populate("role_id").populate("status_id").skip(index * size).limit(size).sort('-email');
        res.status(200).send({
            status: 200,
            index: index,
            size: size,
            count: findAllUser.length,
            data: findAllUser.length === 0 ? "Aucun élément correspondant !" : findAllUser,
        });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('role_id')
            .populate('status_id');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Modification d'utilisateur
const updateUser = async (req, res) => {
    try {
        const filter = { _id: req.body.data.id };
        if (!req.body.data.id) throw new Error("id --> champ non renseigné !");
        const findUser = await User.findOne(filter).populate('role_id').populate('status_id');;
        const update = Object.keys(req.body.data);
        update.forEach(item => findUser[item] = req.body.data[item]);
        findUser.updatedAt = Date.now();
        findUser.updatedBy = findUser._id;
        await findUser.save();
        res.status(200).send({ data: { message: "Utilisateur modifié avec succès", data: findUser } });
    } catch (error) {
        res.status(400).send({ data: { message: error.message } });
    }
};

// Suppression d'utilisateur
const deleteUser = async (req, res) => {
    const filter = { _id: req.body.data.id };
    if (!req.body.data.id) return res.status(400).send({ message: 'id --> champ non renseigné !' });
    try {
        const findUserToDelete = await User.findOneAndUpdate(filter, { isDeleted: true });
        findUserToDelete.deletedBy = req.user._id;
        findUserToDelete.deleteAt = Date.now();
        await findUserToDelete.save();
        res.send({ status: 200, data: "Utilisateur supprimé avec succès !" });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

// Connexion d'utilisateur
const loginUser = async (req, res) => {
    const filter = { email: req.body.data.email };
    try {
        const findUser = await User.findOne(filter);
        if (!findUser || !req.body.data.password) throw new Error("Vérifiez vos informations !");
        const isMatch = await bcrypt.compare(req.body.data.password, findUser.password);
        if (!isMatch) throw new Error("Vérifiez vos informations de connexion ! !");
        const authToken = await findUser.generateTokenAndSaveUser();
        res.send({ status: 200, data: findUser });
    } catch (e) {
        res.status(401).send({ data: { message: e.message } });
    }
};

// Récupérer les informations d'utilisateur
const userInfos = async (req, res) => {
    try {
        if (!req.user || req.user.isDeleted) return res.status(404).send({ status: 404, data: { message: "Utilisateur introuvable." } });
        const user = await User.findOne({email : })
        res.status(200).send({ status: 200, count: 1, data: req.user });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

// Déconnexion d'utilisateur

// Session unique
const userLogout = async (req, res) => {
    try {
        if (!req.user || req.user.isDeleted) return res.status(404).send({ status: 404, data: { message: "Utilisateur introuvable." } });
        const index = req.user.authTokens.findIndex(item => item.authToken === req.auth);
        if (index !== -1) req.user.authTokens.splice(index, 1);
        await req.user.save();
        res.status(200).send({ status: 200, data: { message: "Utilisateur déconnecté !" } });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

// Toutes les sessions
const userLogoutAll = async (req, res) => {
    try {
        req.user.authTokens = [];
        await req.user.save();
        res.status(200).send({ status: 200, data: { message: "Toutes les sessions ont été déconnectées !" } });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

module.exports = {
    createUser,
    getUserByCriteria,
    getUserById,
    updateUser,
    deleteUser,
    loginUser,
    userInfos,
    userLogout,
    userLogoutAll
};

