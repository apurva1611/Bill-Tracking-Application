const de =require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const billController = require('./controllers/billController');
const billsRouter = require('./routes/billRoutes');
const fileRouter = require('./routes/fileRoutes');
const userRouter = require('./routes/userRoutes');
const app = express();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cors());
// 3) ROUTES
app.use('/v1/user/', userRouter);
app.use('/v1/bill/', billsRouter);
app.use('/v1/bill/',fileRouter);
app.get('/v1/bills/',billController.checkUser,billController.getAllBills);
app.get('/v1/bills/due/:id', billController.checkUser, billController.getDueBills);
module.exports = app;
