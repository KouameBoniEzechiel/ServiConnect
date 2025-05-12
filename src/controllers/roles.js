const { Roles } = require('../models/roles');

// Création : Roles       
const createRoles = async (req, res) => {
    try {
        const roles = new Roles(req.body.data);
        const RolesSave = await roles.save();
        res.status(201).send({ status: 200, data: RolesSave, message: "Roles enregistré(e) avec succès !" });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};

// Obtenir liste : Roles
const getRolesByCriteria = async (req, res) => {
    const filter = { isDeleted: false };
    if (req.body.data?.name) {
        filter.name = { $regex: req.body.data.name, $options: "i" };
    }


    // filtre sur les dates
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
        // const findAllRoles = await Roles.find(filter).skip(index * size).limit(size).sort('-email');

        const findAllRoles = await Roles.find(filter).skip(index * size).limit(size);
        res.status(200).send({
            status: 200,
            index: index,
            size: size,
            count: findAllRoles.length,
            data: findAllRoles.length === 0 ? "Aucun élément correspondant !" : findAllRoles,
        });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

// Modification : Roles
const updateRoles = async (req, res) => {
    try {
        const filter = { _id: req.body.data.id };
        if (!req.body.data.id) throw new Error("id --> champ non renseigné !");
        const findRoles = await Roles.findOne(filter);
        const update = Object.keys(req.body.data);
        update.forEach(item => findRoles[item] = req.body.data[item]);
        findRoles.updatedAt = Date.now();
        findRoles.updatedBy = findRoles._id;
        await findRoles.save();
        res.status(200).send({ data: { message: "Roles modifié(e) avec succès", data: findRoles } });
    } catch (error) {
        res.status(400).send({ data: { message: error.message } });
    }
};

// Suppression : Roles
const deleteRoles = async (req, res) => {
    const filter = { _id: req.body.data.id };
    if (!req.body.data.id) return res.status(400).send({ message: 'id --> champ non renseigné !' });
    try {
        const findRolesToDelete = await Roles.findOneAndUpdate(filter, { isDeleted: true });
        findRolesToDelete.deletedBy = req.user._id;
        findRolesToDelete.deleteAt = Date.now();
        await findRolesToDelete.save();
        res.send({ status: 200, data: "Roles supprimé(e) avec succès !" });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

module.exports = {
    createRoles,
    getRolesByCriteria,
    updateRoles,
    deleteRoles
};
