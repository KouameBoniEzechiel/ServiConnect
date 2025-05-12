const { Booking_statuses } = require('../models/booking_statuses');

// Création : Booking_statuses       
const createBooking_statuses = async (req, res) => {
    try {
        const booking_statuses = new Booking_statuses(req.body.data);
        const Booking_statusesSave = await booking_statuses.save();
        res.status(201).send({ status: 200, data: Booking_statusesSave, message: "Booking_statuses enregistré(e) avec succès !" });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
}; 

// Obtenir liste : Booking_statuses
const getBooking_statusesByCriteria = async (req, res) => {
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
       // const findAllBooking_statuses = await Booking_statuses.find(filter).skip(index * size).limit(size).sort('-email');
        
        const findAllBooking_statuses = await Booking_statuses.find(filter).skip(index * size).limit(size);
        res.status(200).send({
            status: 200,
            index: index,
            size: size,
            count: findAllBooking_statuses.length,
            data: findAllBooking_statuses.length === 0 ? "Aucun élément correspondant !" : findAllBooking_statuses,
        });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

// Modification : Booking_statuses
const updateBooking_statuses = async (req, res) => {
    try {
        const filter = { _id: req.body.data.id };
        if (!req.body.data.id) throw new Error("id --> champ non renseigné !");
        const findBooking_statuses = await Booking_statuses.findOne(filter);
        const update = Object.keys(req.body.data);
        update.forEach(item => findBooking_statuses[item] = req.body.data[item]);
        findBooking_statuses.updatedAt = Date.now();
        findBooking_statuses.updatedBy = findBooking_statuses._id;
        await findBooking_statuses.save();
        res.status(200).send({ data: { message: "Booking_statuses modifié(e) avec succès", data: findBooking_statuses } });
    } catch (error) {
        res.status(400).send({ data: { message: error.message } });
    }
};

// Suppression : Booking_statuses
const deleteBooking_statuses = async (req, res) => {
    const filter = { _id: req.body.data.id };
    if (!req.body.data.id) return res.status(400).send({ message: 'id --> champ non renseigné !' });
    try {
        const findBooking_statusesToDelete = await Booking_statuses.findOneAndUpdate(filter, { isDeleted: true });
        findBooking_statusesToDelete.deletedBy = req.user._id;
        findBooking_statusesToDelete.deleteAt = Date.now();
        await findBooking_statusesToDelete.save();
        res.send({ status: 200, data: "Booking_statuses supprimé(e) avec succès !" });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

module.exports = {
    createBooking_statuses,
    getBooking_statusesByCriteria,
    updateBooking_statuses,
    deleteBooking_statuses
};
