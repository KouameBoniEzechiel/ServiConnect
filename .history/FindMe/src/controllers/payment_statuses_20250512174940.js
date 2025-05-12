const { Payment_statuses } = require('../models/payment_statuses');

// Création : Payment_statuses       
const createPayment_statuses = async (req, res) => {
    try {
        const payment_statuses = new Payment_statuses(req.body.data);
        const Payment_statusesSave = await payment_statuses.save();
        res.status(201).send({ status: 200, data: Payment_statusesSave, message: "Payment_statuses enregistré(e) avec succès !" });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
}; 

// Obtenir liste : Payment_statuses
const getPayment_statusesByCriteria = async (req, res) => {
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
       // const findAllPayment_statuses = await Payment_statuses.find(filter).skip(index * size).limit(size).sort('-email');
        
        const findAllPayment_statuses = await Payment_statuses.find(filter).skip(index * size).limit(size);
        res.status(200).send({
            status: 200,
            index: index,
            size: size,
            count: findAllPayment_statuses.length,
            data: findAllPayment_statuses.length === 0 ? "Aucun élément correspondant !" : findAllPayment_statuses,
        });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

// Modification : Payment_statuses
const updatePayment_statuses = async (req, res) => {
    try {
        const filter = { _id: req.body.data.id };
        if (!req.body.data.id) throw new Error("id --> champ non renseigné !");
        const findPayment_statuses = await Payment_statuses.findOne(filter);
        const update = Object.keys(req.body.data);
        update.forEach(item => findPayment_statuses[item] = req.body.data[item]);
        findPayment_statuses.updatedAt = Date.now();
        findPayment_statuses.updatedBy = findPayment_statuses._id;
        await findPayment_statuses.save();
        res.status(200).send({ data: { message: "Payment_statuses modifié(e) avec succès", data: findPayment_statuses } });
    } catch (error) {
        res.status(400).send({ data: { message: error.message } });
    }
};

// Suppression : Payment_statuses
const deletePayment_statuses = async (req, res) => {
    const filter = { _id: req.body.data.id };
    if (!req.body.data.id) return res.status(400).send({ message: 'id --> champ non renseigné !' });
    try {
        const findPayment_statusesToDelete = await Payment_statuses.findOneAndUpdate(filter, { isDeleted: true });
        findPayment_statusesToDelete.deletedBy = req.user._id;
        findPayment_statusesToDelete.deleteAt = Date.now();
        await findPayment_statusesToDelete.save();
        res.send({ status: 200, data: "Payment_statuses supprimé(e) avec succès !" });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

module.exports = {
    createPayment_statuses,
    getPayment_statusesByCriteria,
    updatePayment_statuses,
    deletePayment_statuses
};
