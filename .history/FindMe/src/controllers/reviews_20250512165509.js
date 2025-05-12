const { Reviews } = require('../models/reviews');

// Création : Reviews       
const createReviews = async (req, res) => {
    try {
        const reviews = new Reviews(req.body.data);
        const ReviewsSave = await reviews.save();
        res.status(201).send({ status: 200, data: ReviewsSave, message: "Reviews enregistré(e) avec succès !" });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
}; 

// Obtenir liste : Reviews
const getReviewsByCriteria = async (req, res) => {
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
       // const findAllReviews = await Reviews.find(filter).skip(index * size).limit(size).sort('-email');
        
        const findAllReviews = await Reviews.find(filter)..populate('client_id')
        .populate('provider_id');skip(index * size).limit(size);
        res.status(200).send({
            status: 200,
            index: index,
            size: size,
            count: findAllReviews.length,
            data: findAllReviews.length === 0 ? "Aucun élément correspondant !" : findAllReviews,
        });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

// Modification : Reviews
const updateReviews = async (req, res) => {
    try {
        const filter = { _id: req.body.data.id };
        if (!req.body.data.id) throw new Error("id --> champ non renseigné !");
        const findReviews = await Reviews.findOne(filter);
        const update = Object.keys(req.body.data);
        update.forEach(item => findReviews[item] = req.body.data[item]);
        findReviews.updatedAt = Date.now();
        findReviews.updatedBy = findReviews._id;
        await findReviews.save();
        res.status(200).send({ data: { message: "Reviews modifié(e) avec succès", data: findReviews } });
    } catch (error) {
        res.status(400).send({ data: { message: error.message } });
    }
};

// Suppression : Reviews
const deleteReviews = async (req, res) => {
    const filter = { _id: req.body.data.id };
    if (!req.body.data.id) return res.status(400).send({ message: 'id --> champ non renseigné !' });
    try {
        const findReviewsToDelete = await Reviews.findOneAndUpdate(filter, { isDeleted: true });
        findReviewsToDelete.deletedBy = req.user._id;
        findReviewsToDelete.deleteAt = Date.now();
        await findReviewsToDelete.save();
        res.send({ status: 200, data: "Reviews supprimé(e) avec succès !" });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

module.exports = {
    createReviews,
    getReviewsByCriteria,
    updateReviews,
    deleteReviews
};
