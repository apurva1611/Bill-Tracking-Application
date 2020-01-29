const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
router
  .route('/')
  .get(userController.getAllusers)
  .post(userController.checkBody,userController.createUser,userController.returnUser);
// update and get an user
router
  .route('/self')
  .get(userController.getUser)
  .put(userController.checkUser,userController.checkBody,userController.updateUser)

module.exports = router;