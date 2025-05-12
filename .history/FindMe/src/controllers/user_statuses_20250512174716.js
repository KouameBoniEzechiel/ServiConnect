const { User_statuses } = require('../models/user_statuses');

// Création : User_statuses       
const createUser_statuses = async (req, res) => {
    try {
        const user_statuses = new User_statuses(req.body.data);
        const User_statusesSave = await user_statuses.save();
        res.status(201).send({ status: 200, data: User_statusesSave, message: "User_statuses enregistré(e) avec succès !" });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
}; 

// Obtenir liste : User_statuses
const getUser_statusesByCriteria = async (req, res) => {
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
       // const findAllUser_statuses = await User_statuses.find(filter).skip(index * size).limit(size).sort('-email');
        
        const findAllUser_statuses = await User_statuses.find(filter).skip(index * size).limit(size);
        res.status(200).send({
            status: 200,
            index: index,
            size: size,
            count: findAllUser_statuses.length,
            data: findAllUser_statuses.length === 0 ? "Aucun élément correspondant !" : findAllUser_statuses,
        });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

// Modification : User_statuses
const updateUser_statuses = async (req, res) => {
    try {
        const filter = { _id: req.body.data.id };
        if (!req.body.data.id) throw new Error("id --> champ non renseigné !");
        const findUser_statuses = await User_statuses.findOne(filter);
        const update = Object.keys(req.body.data);
        update.forEach(item => findUser_statuses[item] = req.body.data[item]);
        findUser_statuses.updatedAt = Date.now();
        findUser_statuses.updatedBy = findUser_statuses._id;
        await findUser_statuses.save();
        res.status(200).send({ data: { message: "User_statuses modifié(e) avec succès", data: findUser_statuses } });
    } catch (error) {
        res.status(400).send({ data: { message: error.message } });
    }
};

// Suppression : User_statuses
const deleteUser_statuses = async (req, res) => {
    const filter = { _id: req.body.data.id };
    if (!req.body.data.id) return res.status(400).send({ message: 'id --> champ non renseigné !' });
    try {
        const findUser_statusesToDelete = await User_statuses.findOneAndUpdate(filter, { isDeleted: true });
        findUser_statusesToDelete.deletedBy = req.user._id;
        findUser_statusesToDelete.deleteAt = Date.now();
        await findUser_statusesToDelete.save();
        res.send({ status: 200, data: "User_statuses supprimé(e) avec succès !" });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

module.exports = {
    createUser_statuses,
    getUser_statusesByCriteria,
    updateUser_statuses,
    deleteUser_statuses
};
