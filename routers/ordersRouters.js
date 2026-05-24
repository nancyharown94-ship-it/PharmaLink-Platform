const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/ordercontroller');


router.post( '/', orderController.createOrder);
router.get('/:id', orderController.getOrderById);
router.get('/user/:userId', orderController.getOrdersByUserId);
router.get('/pharmacy/:pharmacyId', orderController.getOrdersByPharmacyId);
router.patch('/:id/status', orderController.updateOrderStatus);
router.put('/:id', orderController.updateOrder);


module.exports = router;    