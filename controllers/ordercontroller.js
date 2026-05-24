const Order = require('../models/orderModel');
const mongoose = require('mongoose');
const userModel = require('../models/userModel');
const Medicine = require('../models/medicineModels');
const { triggerNotification } = require('./notificationController');



const calculateTotals = (items, deliveryFee = 0, discount = 0) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const totalPrice = subtotal + deliveryFee - discount;
  return { subtotal, totalPrice };
};

const createOrder = async (req, res) => {
  try {
    const {
      user,
      pharmacy,
      items,
      deliveryAddress,
      paymentMethod,
      deliveryFee = 0,
      discount = 0,
      notes,
      prescription,
    } = req.body;

    const { subtotal, totalPrice } = calculateTotals(items, deliveryFee, discount);

    const order = await Order.create({
      user,
      pharmacy,
      items,
      deliveryAddress,
      subtotal,
      totalPrice,
      paymentMethod,
      deliveryFee,
      discount,
      notes,
      prescription,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ user: userId })
      .populate('pharmacy', 'name address phone')
      .populate('items.medicine', 'name image price')
      .sort({ createdAt: -1 });  

    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

const getOrdersByPharmacyId = async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const orders = await Order.find({ pharmacy: pharmacyId })
      .populate('user', 'name email phone')
      .populate('items.medicine', 'name image price')
      .sort({ createdAt: -1 });  

    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('user', 'name email phone')
      .populate('pharmacy', 'name address phone')
      .populate('items.medicine', 'name image price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // 1. Trigger stock reduction & notification when out_for_delivery is started
    if (status === 'out_for_delivery' && order.status !== 'out_for_delivery') {
      for (const item of order.items) {
        if (item.medicine) {
          await Medicine.findByIdAndUpdate(item.medicine, {
            $inc: { stock: -item.quantity }
          });
        }
      }
      // Trigger notification for the patient
      const patientMsg = `طلبك رقم #${order._id.toString().slice(-6).toUpperCase()} في الطريق إليك!`;
      await triggerNotification(order.user, patientMsg);
    }

    // 2. Trigger notification to pharmacy when patient confirms receipt (delivered)
    if (status === 'delivered' && order.status !== 'delivered') {
      const pharmacyMsg = `المريض استلم الطلب رقم #${order._id.toString().slice(-6).toUpperCase()} بنجاح!`;
      await triggerNotification(order.pharmacy, pharmacyMsg);
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryAddress, notes } = req.body;

    const updateFields = {};
    if (deliveryAddress) updateFields.deliveryAddress = deliveryAddress;
    if (notes !== undefined) updateFields.notes = notes;

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { returnDocument: 'after', runValidators: true }
    ).populate('user', 'name email phone')
     .populate('pharmacy', 'name address phone')
     .populate('items.medicine', 'name image price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
module.exports = { createOrder, getOrdersByUserId, getOrderById , updateOrderStatus, getOrdersByPharmacyId, updateOrder };