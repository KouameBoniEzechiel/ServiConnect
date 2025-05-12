const { Bookings } = require('../models/bookings');

// Création : Bookings       
const createBookings = async (req, res) => {
    try {
        const bookings = new Bookings(req.body.data);
        const BookingsSave = await bookings.save();
        res.status(201).send({ status: 200, data: BookingsSave, message: "Bookings enregistré(e) avec succès !" });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
}; 

// Obtenir liste : Bookings
const getBookingsByCriteria = async (req, res) => {
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
       // const findAllBookings = await Bookings.find(filter).skip(index * size).limit(size).sort('-email');
        
        const findAllBookings = await Bookings.find(filter)
        .populate('client_id')
        .populate('provider_id')
        .populate('service_id')
        .populate('status_id').skip(index * size).limit(size);
        res.status(200).send({
            status: 200,
            index: index,
            size: size,
            count: findAllBookings.length,
            data: findAllBookings.length === 0 ? "Aucun élément correspondant !" : findAllBookings,
        });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

const getBookingById = async (req, res) => {
    try {
      const booking = await Booking.findById(req.params.id)
        .populate('client_id')
        .populate('provider_id')
        .populate('service_id')
        .populate('status_id');
      if (!booking) return res.status(404).json({ error: 'Booking not found' });
      res.json(booking);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

// Modification : Bookings
const updateBookings = async (req, res) => {
    try {
        const filter = { _id: req.body.data.id };
        if (!req.body.data.id) throw new Error("id --> champ non renseigné !");
        const findBookings = await Bookings.findOne(filter);
        const update = Object.keys(req.body.data);
        update.forEach(item => findBookings[item] = req.body.data[item]);
        findBookings.updatedAt = Date.now();
        findBookings.updatedBy = findBookings._id;
        await findBookings.save();
        res.status(200).send({ data: { message: "Bookings modifié(e) avec succès", data: findBookings } });
    } catch (error) {
        res.status(400).send({ data: { message: error.message } });
    }
};

// Suppression : Bookings
const deleteBookings = async (req, res) => {
    const filter = { _id: req.body.data.id };
    if (!req.body.data.id) return res.status(400).send({ message: 'id --> champ non renseigné !' });
    try {
        const findBookingsToDelete = await Bookings.findOneAndUpdate(filter, { isDeleted: true });
        findBookingsToDelete.deletedBy = req.user._id;
        findBookingsToDelete.deleteAt = Date.now();
        await findBookingsToDelete.save();
        res.send({ status: 200, data: "Bookings supprimé(e) avec succès !" });
    } catch (e) {
        res.status(500).send({ data: { message: e.message } });
    }
};

module.exports = {
    createBookings,
    getBookingsByCriteria,
    updateBookings,
    deleteBookings
};
