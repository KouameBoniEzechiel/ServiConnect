const { Services } = require('../models/services');

// Création : Services       
const createServices = async (req, res) => {
    try {
        const services = new Services(req.body.data);
        const ServicesSave = await services.save();
        res.status(201).send({ status: 200, data: ServicesSave, message: "Services enregistré(e) avec succès !" });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
};

// Obtenir liste : Services
const getServicesByCriteria = async (req, res) => {
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
        // const findAllServices = await Services.find(filter).skip(index * size).limit(size).sort('-email');

        const findAllServices = await Services.find(filter).populate('provider_id').skip(index * size).limit(size);
        res.status(200).send({
            status: 200,
            index: index,
            size: size,
            count: findAllServices.length,
            data: findAllServices.length === 0 ? "Aucun élément correspondant !" : findAllServices,
        });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate('provider_id');
        if (!service) return res.status(404).json({ error: 'Service not found' });
        res.json(service);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Modification : Services
const updateServices = async (req, res) => {
    try {
        const filter = { _id: req.body.data.id };
        if (!req.body.data.id) throw new Error("id --> champ non renseigné !");
        const findServices = await Services.findOne(filter).populate('provider_id');
        const update = Object.keys(req.body.data);
        update.forEach(item => findServices[item] = req.body.data[item]);
        findServices.updatedAt = Date.now();
        findServices.updatedBy = findServices._id;
        await findServices.save();
        res.status(200).send({ data: { message: "Services modifié(e) avec succès", data: findServices } });
    } catch (error) {
        res.status(400).send({ data: { message: error.message } });
    }
};

// Suppression : Services
const deleteServices = async (req, res) => {
    const filter = { _id: req.body.data.id };
    if (!req.body.data.id) return res.status(400).send({ message: 'id --> champ non renseigné !' });
    try {
        const findServicesToDelete = await Services.findOneAndUpdate(filter, { isDeleted: true });
        findServicesToDelete.deletedBy = req.user._id;
        findServicesToDelete.deleteAt = Date.now();
        await findServicesToDelete.save();
        res.send({ status: 200, data: "Services supprimé(e) avec succès !" });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

module.exports = {
    createServices,
    getServicesByCriteria,
    getServiceById,
    updateServices,
    deleteServices
};
