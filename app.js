const dotenv = require('dotenv');   
dotenv.config();
const cors = require('cors');

const express = require('express');
const mongoose = require('mongoose');
const app = express();

const medicineRouters = require('./api/routers/medicineRouters');
const ordersRouters = require('./api/routers/ordersRouters');
const authRoutes = require('./api/routers/authRouters');
const cartRouters = require('./api/routers/cart.Routers');
const analyticsRouters = require('./api/routers/analyticsrouters');
const notificationRouters = require('./api/routers/notificationRouters');
app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api', authRoutes);
app.use('/api/medicines', medicineRouters);
app.use('/api/orders', ordersRouters);
app.use('/api/cart', cartRouters);
app.use('/api/analytics', analyticsRouters);
app.use('/api/notifications', notificationRouters);

/*app.get('/', (req, res) => {
  res.send('Server Running');
});*/
mongoose.connect(
  process.env.MONGO_URI || 'mongodb://localhost:27017/pharmalinkdata'
)
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Error connecting to MongoDB', err));

module.exports = app;