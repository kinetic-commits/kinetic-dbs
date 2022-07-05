const express = require('express');
const router = express.Router();
const {
  getOrder,
  getOrders,
  createOrder,
  updateOrder,
} = require('../controller/order');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getOrders).post(protect, createOrder);

router.route('/:id').get(protect, getOrder).put(protect, updateOrder);

module.exports = router;
