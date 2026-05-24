const Medicine = require('../models/medicineModels'); 
const User = require('../models/userModel');

const getAllMedicines = async (req, res) => {
    try {
        const medicines = await Medicine.find();
        res.status(200).json(medicines);    
    } catch (error) {
        console.log(error); 
        res.status(500).json({ error: error.message }); 
    }
};

const getAvailableMedicines = async (req, res) => {
    try {
        // Find medicines that have stock > 0, are linked to a pharmacy, and have a valid price
        const availableMedicines = await Medicine.find({
            stock: { $gt: 0 },
            pharmacy: { $exists: true, $ne: null },
            price: { $exists: true, $type: 'number' }
        }).populate({ path: 'pharmacy', model: 'User', select: 'name' });
        
        res.status(200).json(availableMedicines);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
}; 
;
const getMedicinesById = async (req, res) => {
const { id } = req.params;  
try {
    const medicine = await Medicine.findById(id).populate({ path: 'pharmacy', model: 'User', select: 'name email phone address' });
    if (!medicine) {
        return res.status(404).json({ error: 'Medicine not found' });
    }
    res.status(200).json(medicine);
} catch (error) {
  console.log(error);
  res.status(500).json({ error: error.message });
}       
};

const addMedicine = async (req, res) => 
    {
    const { 
        name, 
        activeIngredient, 
        manufacturer, 
        therapeuticCategory, 
        dosageForm, 
        price, 
        stock, 
        pharmacy, 
        description,
        discountPercentage,
        images
    } = req.body;

    try { 
        const newMedicine = new Medicine({
            name,
            activeIngredient,
            manufacturer,
            therapeuticCategory,
            dosageForm,
            price,
            stock, 
            pharmacy, 
            description,
            discountPercentage,
            images
        });

        await newMedicine.save();
        res.status(201).json(newMedicine);
    } catch (error) {
        console.log("Validation Error Details:", error.errors);  
        res.status(400).json({ error: error.message }); 
    }
};

const updateMedicineById = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedMedicine = await Medicine.findByIdAndUpdate(
            id, 
            req.body, 
            { returnDocument: 'after', runValidators: true } 
        );

        if (!updatedMedicine) {
            return res.status(404).json({ error: 'Medicine not found' });
        }
        res.status(200).json(updatedMedicine);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




const deleteMedicineById = async (req, res) => {
    const { id } = req.params;  
    try {
        const deletedMedicine = await Medicine.findByIdAndDelete(id);
        if (!deletedMedicine) {
            return res.status(404).json({ error: 'Medicine not found' });
        }
        res.status(200).json({ message: 'Medicine deleted successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};
const searchMedicine = async (req, res) => {
    try {
        const keyword = req.query.keyword;
        if (!keyword) {
            return res.status(400).json({ message: 'Keyword is required' });
        }

        const medicines = await Medicine.find({
            $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { activeIngredient: { $regex: keyword, $options: 'i' } }
            ],
            stock: { $gt: 0 },
            pharmacy: { $exists: true, $ne: null },
            price: { $exists: true, $type: 'number' }
        }).populate({ path: 'pharmacy', model: 'User', select: 'name' });

        res.status(200).json(medicines);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

const getMedicinesByPharmacyId = async (req, res) => {
    try {
        const { pharmacyId } = req.params;
        const medicines = await Medicine.find({ pharmacy: pharmacyId });
        res.status(200).json(medicines);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

const getSuggestions = async (req, res) => {
    try {
        const { tradeName } = req.query;
        if (!tradeName) {
            return res.status(400).json({ message: 'tradeName parameter is required' });
        }

        const medicines = await Medicine.find({
            name: { $regex: tradeName, $options: 'i' }
        }).limit(5);

        const formattedSuggestions = medicines.map(med => ({
            tradeName: med.name,
            scientificName: med.activeIngredient || '',
            category: med.therapeuticCategory || '',
            price: med.price,
            quantity: med.stock,
            description: med.description || ''
        }));

        res.status(200).json(formattedSuggestions);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllMedicines,
    getAvailableMedicines,
    getMedicinesById,
    addMedicine,
    updateMedicineById,
    deleteMedicineById,
    searchMedicine,
    getMedicinesByPharmacyId,
    getSuggestions
};

