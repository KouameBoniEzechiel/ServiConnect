const express = require('express');
const router = new express.Router();
const { createBookings, getBookingsByCriteria, updateBookings, deleteBookings } = require('../controllers/bookings');

router.post("/bookings/create", createBookings);

router.get("/bookings/getByCriteria", getBookingsByCriteria);

router.patch("/bookings/update", updateBookings);

router.delete("/bookings/delete", deleteBookings);

module.exports = router;
