require("dotenv").config();
const mongoose = require("mongoose");

async function connectDb() {
    try {
        await mongoose.connect(process.env.url);
        console.log("✅ Connexion à MongoDB réussie !");
    } catch (err) {
        console.error("❌ Échec de connexion à MongoDB", err);
        process.exit(1);
    }
}

module.exports = { connectDb };
