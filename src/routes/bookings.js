const express = require('express');
const router = new express.Router();
const { createBookings, getBookingsByCriteria, getBookingById, updateBookings, deleteBookings } = require('../controllers/bookings');

router.post("/bookings/create", createBookings);

router.post("/bookings/getByCriteria", getBookingsByCriteria);

router.get("/bookings/getBookingById", getBookingById);

router.patch("/bookings/update", updateBookings);

router.delete("/bookings/delete", deleteBookings);

module.exports = router;
