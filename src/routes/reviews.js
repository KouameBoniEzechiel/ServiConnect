const express = require('express');
const router = new express.Router();
const { createReviews, getReviewsByCriteria, getReviewById, updateReviews, deleteReviews } = require('../controllers/reviews');

router.post("/reviews/create", createReviews);

router.post("/reviews/getByCriteria", getReviewsByCriteria);

router.get("/reviews/getReviewById", getReviewById);

router.patch("/reviews/update", updateReviews);

router.delete("/reviews/delete", deleteReviews);

module.exports = router;
