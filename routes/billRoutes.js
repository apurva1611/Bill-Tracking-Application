const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');
router
  .route('/')
  .post(billController.checkUser,billController.checkBody,billController.setId,billController.createBill,billController.returnBill);
// update and get an user
router
  .route('/:id')
  .get(billController.checkUserForError,billController.checkBill,billController.getBill)
  .put(billController.checkUserForError,billController.checkBody,billController.checkBill,billController.updateBill,billController.getBill)
  .delete(billController.checkUserForError,billController.checkBill,billController.deleteBill)

module.exports = router;