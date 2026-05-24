const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  itemType: {
    type: String,
    default: "medication"
  }
}, { 
  // القوس اللي فوق قفل الـ Fields، والـ timestamps هنا في الـ Options
  timestamps: true 
});

module.exports = mongoose.model("Favorite", favoriteSchema);