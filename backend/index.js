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
const paymentRoutes = require('./routes/paymentRoutes');

//midlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use('/uploads', express.static('uploads'));
app.use(cors({
    origin: ['http://localhost:3000'], // Allowed origins
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
app.use('/api/payment', paymentRoutes);

const port = process.env.PORT || 5000;
//database connection

const main = async () => {
    await mongoose.connect(process.env.MONGODB_URL)
}

main().then(() => {
    console.log("connected succesfully to the database")
}).catch((err) => {
    console.log(err)
});

app.listen(port, () => {
    console.log("server running on ", port);
});

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
