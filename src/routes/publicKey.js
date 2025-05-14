const express = require('express');
const router = new express.Router();
const { ObjectToBase64 } = require('../utils/utils');
require("dotenv").config();


router.get("/key/getPubKey", async (req, res, next) => {
    const pubKey = process.env.FRONT_SECRET_KEY;
    try {
        if (pubKey) {
            res.send({
                data: {
                    key: ObjectToBase64(pubKey)
                }
            })
        } else {
            throw new Error("Erreur lors de la récupération de la clé")
        }
    } catch (e) {
        res.status(500).send({
            message: e.message
        })
    }


});

module.exports = router;
