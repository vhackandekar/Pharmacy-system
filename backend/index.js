const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const PredictiveRefillAgent = require('./Agents/PredictiveRefillAgent');
const User = require('./schema/User');

// Load env vars immediately
dotenv.config();

const app = express();
const authRoutes = require('./routes/authRoutes');
const agentRoutes = require('./routes/agentRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const adminRoutes = require('./routes/adminRoutes');

//midlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use('/uploads', express.static('uploads'));
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'], // Allowed origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true // Allow cookies/auth headers
}));

app.use('/api/auth', authRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/medicine', medicineRoutes);
app.use('/api/prescription', prescriptionRoutes);
app.use('/api/notify', notificationRoutes);
app.use('/webhook/n8n', webhookRoutes);
app.use('/api/admin', adminRoutes);

const port = process.env.PORT || 5000;
//database connection

const main = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URL, {
            serverSelectionTimeoutMS: 20000, // Increase timeout to 20s
            family: 4 // Use IPv4
        });
        console.log("Connected successfully to the database");

        app.listen(port, () => {
            console.log("Server running on port", port);
        });
    } catch (err) {
        console.error("Critical: Database connection failed!");
        console.error(err);
        process.exit(1); // Exit if DB connection fails on startup
    }
};

main();

// FR-9: Predictive Refill Cron Job (Runs every day at Midnight)
cron.schedule('0 0 * * *', async () => {
    console.log('Running daily predictive refill analysis...');
    try {
        const users = await User.find({ role: 'USER' });
        for (const user of users) {
            await PredictiveRefillAgent.analyzeAndAlert(user._id);
        }
        console.log('Daily predictive refill analysis completed.');
    } catch (error) {
        console.error('Cron Job Error:', error);
    }
});
