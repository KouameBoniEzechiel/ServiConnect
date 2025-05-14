const express = require('express');
const { decryptData } = require("../utils/utils"); 
const router = express.Router();

router.post('/data/decrypt', (req, res) => {
  try {
    const { encryptedData } = req.body.data;
    if (!encryptedData) {
      return res.status(400).json({ error: 'Champ encryptedData requis' });
    }

    const result = decryptData(encryptedData);
    res.send({decrypted: result });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors du déchiffrement', details: err.message });
  }
});

module.exports = router;
