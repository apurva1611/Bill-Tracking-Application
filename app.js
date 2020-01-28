const express = require('express');
const bodyparser = require('body-parser');
const userRouter = require('./routes/userRoutes');
const app = express();
app.use(bodyparser.json());

// 3) ROUTES
app.use('/v1/user/', userRouter);
module.exports = app;
