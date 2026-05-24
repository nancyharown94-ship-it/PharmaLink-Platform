const mongoose = require('mongoose');
const medicineModel = require('../models/medicinemodels'); 
const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');
const cartModel = require('../models/cartModel');
const Favorite = require('../models/favoutitesModels');


exports.addFavorite = async (req, res) => { 
    try {
        const { userId, itemName, itemType } = req.body;
        // استخدام الاسم الموحد Favorite
        const newFavorite = new Favorite({ userId, itemName, itemType });
        await newFavorite.save();
        res.status(201).json({ message: 'Favorite added successfully', favorite: newFavorite });
    } catch (error) {
        res.status(500).json({ message: 'Error adding favorite', error: error.message });
    } 
};

exports.getFavorites = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const favorites = await Favorite.find({ userId }); 
        
        if (!favorites || favorites.length === 0) {
            return res.status(200).json({ message: "No favorites found for this user", data: [] });
        }

        res.status(200).json(favorites);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching favorites', error: error.message });
    }
};

exports.deleteFavorite = async (req, res) => {
    const favoriteId = req.params.id;
    try {
    
        await Favorite.findByIdAndDelete(favoriteId);
        res.status(200).json({ message: 'Favorite deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting favorite', error: error.message });
    }
};