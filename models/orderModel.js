const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
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
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Price cannot be negative"],
    },
    medicineSnapshot: {
      name: { type: String, required: true },
      dosageForm: String,
      strength: String,
      manufacturer: String,
      image: String,
      requiresPrescription: Boolean,
    },
  },
  { _id: true }
);

const deliveryAddressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    governorate: { type: String, required: true },
    phone: String,
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    note: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Pharmacy reference is required"],
    },
    items: {
      type: [orderItemSchema],
      required: [true, "Order must have at least one item"],
      validate: {
        validator: (arr) => arr && arr.length > 0,
        message: "Order must contain at least one item",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled", "rejected"],
        message: "Invalid order status",
      },
      default: "pending",
    },
    statusHistory: [statusHistorySchema],
    deliveryAddress: {
      type: deliveryAddressSchema,
      required: [true, "Delivery address is required"],
    },
    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery", "card", "wallet"],
      default: "cash_on_delivery",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    prescription: {
      imageUrl: { type: String, default: null },
      isVerified: { type: Boolean, default: false },
      verifiedAt: Date,
    },
    subtotal: {
      type: Number,
      required: [true, "Subtotal is required"],
      min: [0, "Subtotal cannot be negative"],
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Total price cannot be negative"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    estimatedDeliveryAt: Date,
    deliveredAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderSchema.pre("save", async function () {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `PL-${timestamp}-${random}`;
  }

  if (this.isModified("status")) {
    this.statusHistory.push({ status: this.status });
    if (this.status === "delivered") {
      this.deliveredAt = new Date();
    }
  }
 
});

// ─── Virtuals ─────────────────────────────────────────────────────────────────
orderSchema.virtual("itemCount").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;