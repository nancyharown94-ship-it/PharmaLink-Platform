const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  passwordHash: {
    type: String,
    required: [true, 'Please add a password']
  },
  role: {
    type: String,
    enum: ['Patient', 'Pharmacy', 'Admin'],
    default: 'Patient',
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  nationalId: {
    type: String,
    match: [/^[0-9]{14}$/, 'Please add a valid 14-digit National ID']
  },
  pharmacyType: {
    type: String,
    enum: ['private', 'hospital', 'insurance', 'خاصة', 'مستشفي خاصة', 'مستشفى خاصة', 'تابعة للتأمين', 'Private', 'Private Hospital', 'Insurance-Affiliated']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  licenseNumber: {
    type: String
  },
  workingHours: {
    from: String,
    to: String
  },
  pharmacyStatus: {
    type: String,
    enum: ['مفتوحة الآن', 'مغلقة', 'تعمل 24 ساعة', 'Open Now', 'Closed', '24/7 Open'],
    default: 'مفتوحة الآن'
  },
  profilePhoto: {
    type: String,
    default: ""
  },
  addresses: {
    type: [{
      title: String,
      details: String,
      phone: String
    }],
    default: []
  }
}, {
  timestamps: true 
});

userSchema.pre('save', async function() {
  if (!this.isModified('passwordHash')) {
     return;
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);