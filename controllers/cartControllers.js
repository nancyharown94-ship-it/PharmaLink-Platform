const cart = require("../models/cartModel");
const Medicine = require("../models/medicineModels");

const addCartByUserId = async (req, res) => {
    try {
        const { userId, medicineId, quantity, price } = req.body;

        const medicine = await Medicine.findById(medicineId);
        if (!medicine) {
            return res.status(404).json({ message: "Medicine not found" });
        }

        if (medicine.stock < quantity) {
            return res.status(400).json({ 
                message: `Not enough stock. Available quantity: ${medicine.stock}` 
            });
        }

        let userCart = await cart.findOne({ user: userId });
        if (!userCart) {
            userCart = new cart({ user: userId, pharmacy: medicine.pharmacy, items: [] });
        } else if (userCart.pharmacy && userCart.pharmacy.toString() !== medicine.pharmacy.toString()) {
            return res.status(400).json({ message: "Cannot add items from different pharmacies to the same cart" });
        }

        const itemIndex = userCart.items.findIndex(item => item.medicine.toString() === medicineId);

        const finalPrice = price || medicine.price;

        if (itemIndex > -1) {
            const newQuantity = userCart.items[itemIndex].quantity + quantity;
            
            if (newQuantity > medicine.stock) {
                return res.status(400).json({ message: `Total requested quantity exceeds available stock. Max allowed: ${medicine.stock}` });
            }
            
            userCart.items[itemIndex].quantity = newQuantity;
            userCart.items[itemIndex].priceAtAddition = finalPrice; 
        } else {
            userCart.items.push({ 
                medicine: medicineId, 
                quantity: quantity,
                priceAtAddition: finalPrice // السعر الممرر من الـ JSON
            });
        }

        // 5. حفظ التعديلات
        await userCart.save();

        res.status(200).json({ message: "Item added to cart successfully", cart: userCart });

    } catch (error) {
        console.error("Error adding item to cart:", error);
        res.status(500).json({ message: "Failed to add item to cart" });
    }
};

module.exports = { addCartByUserId };
