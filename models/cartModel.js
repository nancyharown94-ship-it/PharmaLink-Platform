
const mongoose = require("mongoose");
 
const cartItemSchema = new mongoose.Schema(
  {
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: [true, "Medicine reference is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      max: [100, "Quantity cannot exceed 100 per item"],
    },
    priceAtAddition: {
      type: Number,
      required: [true, "Price at time of addition is required"],
      min: [0, "Price cannot be negative"],
    },
    medicineSnapshot: {
      name: String,
      dosageForm: String,
      strength: String,
      image: String,
    },
  },
  { _id: true, timestamps: false }
);
 
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true, 
    },
    items: {
      type: [cartItemSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 50,
        message: "Cart cannot contain more than 50 different items",
      },
    },
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
 
cartSchema.virtual("totalItems").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});
 
cartSchema.virtual("totalPrice").get(function () {
  return +this.items
    .reduce((sum, item) => sum + item.priceAtAddition * item.quantity, 0)
    .toFixed(2);
});
 
cartSchema.methods.addItem = function (medicineId, quantity, price, snapshot) {
  const existingItem = this.items.find(
    (item) => item.medicine.toString() === medicineId.toString()
  );
 
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      medicine: medicineId,
      quantity,
      priceAtAddition: price,
      medicineSnapshot: snapshot,
    });
  }
};
 
cartSchema.methods.removeItem = function (medicineId) {
  this.items = this.items.filter(
    (item) => item.medicine.toString() !== medicineId.toString()
  );
};
 
cartSchema.methods.clearCart = function () {
  this.items = [];
  this.pharmacy = null;
};
 
const Cart = mongoose.model("Cart", cartSchema);
 
module.exports = Cart;