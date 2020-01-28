const express = require('express');
const bodyparser = require('body-parser');
const billController = require('./controllers/billController');
const billsRouter = require('./routes/billRoutes');
const userRouter = require('./routes/userRoutes');
const app = express();
app.use(bodyparser.json());

// 3) ROUTES
app.use('/v1/user/', userRouter);
app.use('/v1/bill/', billsRouter);
app.get('/v1/bills/',billController.checkUser,billController.getAllBills);
module.exports = app;
