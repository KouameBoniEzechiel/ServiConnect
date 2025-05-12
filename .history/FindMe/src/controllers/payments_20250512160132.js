const { Payments } = require('../models/payments');

// Création : Payments       
const createPayments = async (req, res) => {
    try {
        const payments = new Payments(req.body.data);
        const PaymentsSave = await payments.save();
        res.status(201).send({ status: 200, data: PaymentsSave, message: "Payments enregistré(e) avec succès !" });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
}; 

// Obtenir liste : Payments
const getPaymentsByCriteria = async (req, res) => {
    const filter = { isDeleted: false };
    if (req.body.data?.name) {
        filter.name = { $regex: req.body.data.name, $options: "i" };
    } 


// filtre sur les dates
    if (req.body.data?.createdAt.startDate && req.body.data?.createdAt.endDate) {
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
       // const findAllPayments = await Payments.find(filter).skip(index * size).limit(size).sort('-email');
        
        const findAllPayments = await Payments.find(filter).skip(index * size).limit(size);
        res.status(200).send({
            status: 200,
            index: index,
            size: size,
            count: findAllPayments.length,
            data: findAllPayments.length === 0 ? "Aucun élément correspondant !" : findAllPayments,
        });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

// Modification : Payments
const updatePayments = async (req, res) => {
    try {
        const filter = { _id: req.body.data.id };
        if (!req.body.data.id) throw new Error("id --> champ non renseigné !");
        const findPayments = await Payments.findOne(filter);
        const update = Object.keys(req.body.data);
        update.forEach(item => findPayments[item] = req.body.data[item]);
        findPayments.updatedAt = Date.now();
        findPayments.updatedBy = findPayments._id;
        await findPayments.save();
        res.status(200).send({ data: { message: "Payments modifié(e) avec succès", data: findPayments } });
    } catch (error) {
        res.status(400).send({ data: { message: error.message } });
    }
};

// Suppression : Payments
const deletePayments = async (req, res) => {
    const filter = { _id: req.body.data.id };
    if (!req.body.data.id) return res.status(400).send({ message: 'id --> champ non renseigné !' });
    try {
        const findPaymentsToDelete = await Payments.findOneAndUpdate(filter, { isDeleted: true });
        findPaymentsToDelete.deletedBy = req.user._id;
        findPaymentsToDelete.deleteAt = Date.now();
        await findPaymentsToDelete.save();
        res.send({ status: 200, data: "Payments supprimé(e) avec succès !" });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

module.exports = {
    createPayments,
    getPaymentsByCriteria,
    updatePayments,
    deletePayments
};
