const mongoose = require("mongoose");
 
const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    activeIngredient: {
      type: String,
      trim: true,
      maxlength: [300, "Active ingredient cannot exceed 300 characters"],
    },
    manufacturer: {
      type: String,
      required: [true, "Manufacturer is required"],
      trim: true,
      maxlength: [150, "Manufacturer name cannot exceed 150 characters"],
    },
    therapeuticCategory: {
      type: String,
      required: [true, "Therapeutic category is required"],
      trim: true,
      maxlength: [100, "Category cannot exceed 100 characters"],
    },
    dosageForm: {
      type: String,
      required: [true, "Dosage form is required"],
      trim: true,
      maxlength: [100, "Dosage form cannot exceed 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
      max: [100, "Discount cannot exceed 100%"],
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    requiresPrescription: {
      type: Boolean,
      default: false,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: "Cannot upload more than 5 images per medicine",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    pharmacy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pharmacy",
      required: [true, "Pharmacy reference is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiryDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
 
medicineSchema.virtual("finalPrice").get(function () {
  if (!this.discountPercentage) return this.price;
  return +(this.price * (1 - this.discountPercentage / 100)).toFixed(2);
});
 
medicineSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});
 
medicineSchema.pre("find", function (next) {
  if (!this._conditions.hasOwnProperty("isActive")) {
    this.where({ isActive: true });
  }
  
});
 
medicineSchema.pre("findOne", function (next) {
  if (!this._conditions.hasOwnProperty("isActive")) {
    this.where({ isActive: true });
  }
  
});

const Medicine = mongoose.models.Medicine || mongoose.model("Medicine", medicineSchema);
module.exports = Medicine;