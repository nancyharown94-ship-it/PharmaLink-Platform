const express = require('express');
const router = express.Router();
const analyticsController = require('../../controllers/analyticsControllers');
router.get('/', 
analyticsController.getAnalytics
);

router.get('/medicine/:id', analyticsController.getMedicineSalesAnalytics);
router.get('/users' , analyticsController.getUserAnalytics);
router.get('/carts' , analyticsController.getCartAnalytics);
router.get('/pharmacies/:pharmacyId' , analyticsController.getPharmacyAnalytics );
module.exports = router;
