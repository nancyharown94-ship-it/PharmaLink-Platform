const express = require('express');

const router = express.Router();
const medicineControllers = require('../../controllers/medicineControllers');


router.get('/',  medicineControllers.getAllMedicines);
router.get('/available', medicineControllers.getAvailableMedicines);
router.get('/search', medicineControllers.searchMedicine);
router.get('/suggestions', medicineControllers.getSuggestions);
router.get('/pharmacy/:pharmacyId', medicineControllers.getMedicinesByPharmacyId);
router.get('/:id', medicineControllers.getMedicinesById);
router.post('/', medicineControllers.addMedicine);
router.put('/:id', medicineControllers.updateMedicineById);
router.delete('/:id', medicineControllers.deleteMedicineById);  
module.exports = router;