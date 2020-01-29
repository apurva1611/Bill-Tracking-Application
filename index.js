const express = require('express');
const bodyparser = require('body-parser');
const userController = require('./controllers/userController');
const app = express();
app.use(bodyparser.json());

app.listen(3000, () => console.log('Express server is runnig at port no : 3000'));

//Get all employees
app.get('/v1/user',userController.getAllusers);

//Insert an employees
app.post('/v1/user',userController.checkBody,userController.createUser,userController.returnUser);
// get an user
app.get('/v1/user/self',userController.getUser)

//Update an employees
app.put('/v1/user/self',userController.checkUser,userController.checkBody,userController.updateUser);
module.exports = app;