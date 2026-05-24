const mongoose = require('mongoose');
const medicineModel = require('../models/medicinemodels'); 
const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');
const cartModel = require('../models/cartModel');


exports.getAnalytics = async (req, res) => {
    try {
        const [totalMedicines, totalOrders, totalUsers, totalCarts] = await Promise.all([
            medicineModel.countDocuments(),
            orderModel.countDocuments(),
            userModel.countDocuments(),
            cartModel.countDocuments()
        ]);

        res.json({
        
            totalMedicines,
            totalOrders,
            totalUsers,
            totalCarts
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMedicineSalesAnalytics = async (req, res) => {
    try {
        const medicineId = req.params.id;

        // 1. التأكد إن الدواء موجود أصلاً
        const medicine = await medicineModel.findById(medicineId);
        if (!medicine) {
            return res.status(404).json({ error: 'Medicine not found' });
        }

        
        const orders = await orderModel.find({ "items.medicine": medicineId });
        
        let totalQuantitySold = 0;
        orders.forEach(order => {
            const item = order.items.find(i => i.medicine.toString() === medicineId);
            if (item) {
                totalQuantitySold += item.quantity || 1; // لو مفيش quantity بنعتبرها 1
            }
        });

        res.json({
            medicineName: medicine.name,
            totalOrders: orders.length,     
            totalQuantitySold: totalQuantitySold, 
            currentStock: medicine.stock    
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
exports.getUserAnalytics = async (req, res) => {
    try {
        const totalUsers = await userModel.countDocuments();    
        res.json({ totalUsers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }   
};
exports.getCartAnalytics = async (req, res) => {
    try {
        const totalCarts = await cartModel.countDocuments();    
        res.json({ totalCarts });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }   
};
exports.getPharmacyAnalytics = async (req, res) => {
    try {
        const { pharmacyId } = req.params; 
        const pharmacyObjectId = new mongoose.Types.ObjectId(pharmacyId);

        const [pendingCount, deliveredCount, revenueStats, totalMedicines] = await Promise.all([
            orderModel.countDocuments({ pharmacy: pharmacyId, status: 'pending' }),
            orderModel.countDocuments({ pharmacy: pharmacyId, status: 'delivered' }),
            orderModel.aggregate([
                { $match: { pharmacy: pharmacyObjectId, status: 'delivered' } },
                { $group: { 
                    _id: null, 
                    totalRevenue: { $sum: "$totalPrice" }
                }}
            ]),
            medicineModel.countDocuments({ pharmacy: pharmacyId })
        ]);

        res.json({
            pharmacyName: process.env.PHARMACY_NAME || 'My Pharmacy',
            totalMedicines,
            pendingOrdersCount: pendingCount,
            deliveredOrdersCount: deliveredCount,
            totalSales: revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0,
            currency: "EGP"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};