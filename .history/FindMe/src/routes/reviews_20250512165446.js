const express = require('express');
const router = new express.Router();
const { createReviews, getReviewsByCriteria, getReviewById, updateReviews, deleteReviews } = require('../controllers/reviews');

router.post("/reviews/create", createReviews);

router.get("/reviews/getByCriteria", getReviewsByCriteria);

router.get("/reviews/getReviewById", getReviewsByCriteria);

router.patch("/reviews/update", updateReviews);

router.delete("/reviews/delete", deleteReviews);

module.exports = router;
