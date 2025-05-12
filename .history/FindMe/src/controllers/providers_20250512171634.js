const { Providers } = require('../models/providers');

// Création : Providers       
const createProviders = async (req, res) => {
    try {
        const providers = new Providers(req.body.data);
        const ProvidersSave = await providers.save();
        res.status(201).send({ status: 200, data: ProvidersSave, message: "Providers enregistré(e) avec succès !" });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
}; 

// Obtenir liste : Providers
const getProvidersByCriteria = async (req, res) => {
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
       // const findAllProviders = await Providers.find(filter).skip(index * size).limit(size).sort('-email');
        
        const findAllProviders = await Providers.find(filter).populate('user_id').populate('profession_id').populate('status_id').populate('services').skip(index * size).limit(size);
        res.status(200).send({
            status: 200,
            index: index,
            size: size,
            count: findAllProviders.length,
            data: findAllProviders.length === 0 ? "Aucun élément correspondant !" : findAllProviders,
        });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

const getProviderById = async (req, res) => {
    try {
      const provider = await Providers.findById(req.params.id)
        .populate('user_id')
        .populate('profession_id')
        .populate('status_id')
        .populate('services');
      if (!provider) return res.status(404).json({ error: 'Provider not found' });
      res.json(provider);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

// Modification : Providers
const updateProviders = async (req, res) => {
    try {
        const filter = { _id: req.body.data.id };
        if (!req.body.data.id) throw new Error("id --> champ non renseigné !");
        const findProviders = await Providers.findOne(filter).populate('user_id').populate('profession_id').populate('profession_id').populate('services');
        const update = Object.keys(req.body.data);
        update.forEach(item => findProviders[item] = req.body.data[item]);
        findProviders.updatedAt = Date.now();
        findProviders.updatedBy = findProviders._id;
        await findProviders.save();
        res.status(200).send({ data: { message: "Providers modifié(e) avec succès", data: findProviders } });
    } catch (error) {
        res.status(400).send({ data: { message: error.message } });
    }
};

// Suppression : Providers
const deleteProviders = async (req, res) => {
    const filter = { _id: req.body.data.id };
    if (!req.body.data.id) return res.status(400).send({ message: 'id --> champ non renseigné !' });
    try {
        const findProvidersToDelete = await Providers.findOneAndUpdate(filter, { isDeleted: true });
        findProvidersToDelete.deletedBy = req.user._id;
        findProvidersToDelete.deleteAt = Date.now();
        await findProvidersToDelete.save();
        res.send({ status: 200, data: "Providers supprimé(e) avec succès !" });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

module.exports = {
    createProviders,
    getProvidersByCriteria,
    getProviderById,
    updateProviders,
    deleteProviders
};
