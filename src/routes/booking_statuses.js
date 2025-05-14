const express = require('express');
const router = new express.Router();
const { createBooking_statuses, getBooking_statusesByCriteria, updateBooking_statuses, deleteBooking_statuses } = require('../controllers/booking_statuses');

router.post("/booking_statuses/create", createBooking_statuses);

router.post("/booking_statuses/getByCriteria", getBooking_statusesByCriteria);

router.patch("/booking_statuses/update", updateBooking_statuses);

router.delete("/booking_statuses/delete", deleteBooking_statuses);

module.exports = router;
