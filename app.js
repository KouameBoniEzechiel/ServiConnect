const { connectDb } = require('./src/services/database');
//const {logger} = require('./src/middlewares/logger');

require("dotenv").config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

connectDb().catch((error) => console.log("erreur: ", error))

app.use(express.json());
//app.use(logger);
const admin_logsRoutes = require('./src/routes/admin_logs');
const booking_statusesRoutes = require('./src/routes/booking_statuses');
const bookingsRoutes = require('./src/routes/bookings');
const payment_statusesRoutes = require('./src/routes/payment_statuses');
const paymentsRoutes = require('./src/routes/payments');
const professionsRoutes = require('./src/routes/professions');
const providersRoutes = require('./src/routes/providers');
const providers_statusesRoutes = require('./src/routes/providers_statuses');
const reviewsRoutes = require('./src/routes/reviews');
const rolesRoutes = require('./src/routes/roles');
const servicesRoutes = require('./src/routes/services');
const userRoutes = require('./src/routes/user');
const user_activity_logsRoutes = require('./src/routes/user_activity_logs');
const user_statusesRoutes = require('./src/routes/user_statuses');
const decryptData = require('./src/routes/decrypt');
const pubkey = require('./src/routes/publicKey');



app.use(admin_logsRoutes);
app.use(booking_statusesRoutes);
app.use(bookingsRoutes);
app.use(payment_statusesRoutes);
app.use(paymentsRoutes);
app.use(professionsRoutes);
app.use(providersRoutes);
app.use(providers_statusesRoutes);
app.use(reviewsRoutes);
app.use(rolesRoutes);
app.use(servicesRoutes);
app.use(userRoutes);
app.use(user_activity_logsRoutes);
app.use(user_statusesRoutes);
app.use(decryptData);
app.use(pubkey);

app.listen(port, () => {
    console.log(`Le serveur est lancé sur http://localhost:${port}`)
})
