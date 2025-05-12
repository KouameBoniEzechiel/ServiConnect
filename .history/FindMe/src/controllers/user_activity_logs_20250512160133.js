const { User_activity_logs } = require('../models/user_activity_logs');

// Création : User_activity_logs       
const createUser_activity_logs = async (req, res) => {
    try {
        const user_activity_logs = new User_activity_logs(req.body.data);
        const User_activity_logsSave = await user_activity_logs.save();
        res.status(201).send({ status: 200, data: User_activity_logsSave, message: "User_activity_logs enregistré(e) avec succès !" });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
}; 

// Obtenir liste : User_activity_logs
const getUser_activity_logsByCriteria = async (req, res) => {
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
       // const findAllUser_activity_logs = await User_activity_logs.find(filter).skip(index * size).limit(size).sort('-email');
        
        const findAllUser_activity_logs = await User_activity_logs.find(filter).skip(index * size).limit(size);
        res.status(200).send({
            status: 200,
            index: index,
            size: size,
            count: findAllUser_activity_logs.length,
            data: findAllUser_activity_logs.length === 0 ? "Aucun élément correspondant !" : findAllUser_activity_logs,
        });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

// Modification : User_activity_logs
const updateUser_activity_logs = async (req, res) => {
    try {
        const filter = { _id: req.body.data.id };
        if (!req.body.data.id) throw new Error("id --> champ non renseigné !");
        const findUser_activity_logs = await User_activity_logs.findOne(filter);
        const update = Object.keys(req.body.data);
        update.forEach(item => findUser_activity_logs[item] = req.body.data[item]);
        findUser_activity_logs.updatedAt = Date.now();
        findUser_activity_logs.updatedBy = findUser_activity_logs._id;
        await findUser_activity_logs.save();
        res.status(200).send({ data: { message: "User_activity_logs modifié(e) avec succès", data: findUser_activity_logs } });
    } catch (error) {
        res.status(400).send({ data: { message: error.message } });
    }
};

// Suppression : User_activity_logs
const deleteUser_activity_logs = async (req, res) => {
    const filter = { _id: req.body.data.id };
    if (!req.body.data.id) return res.status(400).send({ message: 'id --> champ non renseigné !' });
    try {
        const findUser_activity_logsToDelete = await User_activity_logs.findOneAndUpdate(filter, { isDeleted: true });
        findUser_activity_logsToDelete.deletedBy = req.user._id;
        findUser_activity_logsToDelete.deleteAt = Date.now();
        await findUser_activity_logsToDelete.save();
        res.send({ status: 200, data: "User_activity_logs supprimé(e) avec succès !" });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

module.exports = {
    createUser_activity_logs,
    getUser_activity_logsByCriteria,
    updateUser_activity_logs,
    deleteUser_activity_logs
};
