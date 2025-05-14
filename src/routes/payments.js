const express = require('express');
const router = new express.Router();
const { createPayments, getPaymentsByCriteria, updatePayments, deletePayments } = require('../controllers/payments');

router.post("/payments/create", createPayments);

router.post("/payments/getByCriteria", getPaymentsByCriteria);

router.patch("/payments/update", updatePayments);

router.delete("/payments/delete", deletePayments);

module.exports = router;
