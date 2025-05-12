const { Admin_logs } = require('../models/admin_logs');

// Création : Admin_logs       
const createAdmin_logs = async (req, res) => {
    try {
        const admin_logs = new Admin_logs(req.body.data);
        const Admin_logsSave = await admin_logs.save();
        res.status(201).send({ status: 200, data: Admin_logsSave, message: "Admin_logs enregistré(e) avec succès !" });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
}; 

// Obtenir liste : Admin_logs
const getAdmin_logsByCriteria = async (req, res) => {
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
       // const findAllAdmin_logs = await Admin_logs.find(filter).skip(index * size).limit(size).sort('-email');
        
        const findAllAdmin_logs = await Admin_logs.find(filter).skip(index * size).limit(size);
        res.status(200).send({
            status: 200,
            index: index,
            size: size,
            count: findAllAdmin_logs.length,
            data: findAllAdmin_logs.length === 0 ? "Aucun élément correspondant !" : findAllAdmin_logs,
        });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

// Modification : Admin_logs
const updateAdmin_logs = async (req, res) => {
    try {
        const filter = { _id: req.body.data.id };
        if (!req.body.data.id) throw new Error("id --> champ non renseigné !");
        const findAdmin_logs = await Admin_logs.findOne(filter);
        const update = Object.keys(req.body.data);
        update.forEach(item => findAdmin_logs[item] = req.body.data[item]);
        findAdmin_logs.updatedAt = Date.now();
        findAdmin_logs.updatedBy = findAdmin_logs._id;
        await findAdmin_logs.save();
        res.status(200).send({ data: { message: "Admin_logs modifié(e) avec succès", data: findAdmin_logs } });
    } catch (error) {
        res.status(400).send({ data: { message: error.message } });
    }
};

// Suppression : Admin_logs
const deleteAdmin_logs = async (req, res) => {
    const filter = { _id: req.body.data.id };
    if (!req.body.data.id) return res.status(400).send({ message: 'id --> champ non renseigné !' });
    try {
        const findAdmin_logsToDelete = await Admin_logs.findOneAndUpdate(filter, { isDeleted: true });
        findAdmin_logsToDelete.deletedBy = req.user._id;
        findAdmin_logsToDelete.deleteAt = Date.now();
        await findAdmin_logsToDelete.save();
        res.send({ status: 200, data: "Admin_logs supprimé(e) avec succès !" });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

module.exports = {
    createAdmin_logs,
    getAdmin_logsByCriteria,
    updateAdmin_logs,
    deleteAdmin_logs
};
