const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign(
    { id: id.toString(), role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

//================= REGISTER =================
exports.registerUser = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role, 
      phone, 
      address, 
      licenseNum, 
      pharmacyName, 
      pharmacyAddress,
      nationalId,
      pharmacyType 
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name: (role === 'Pharmacy' && pharmacyName) ? pharmacyName : name,
      email,
      passwordHash: password,
      role: role || 'Patient',
      phone,
      address: (role === 'Pharmacy' && pharmacyAddress) ? pharmacyAddress : address,
      licenseNumber: licenseNum,
      nationalId,
      pharmacyType
    });

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      nationalId: user.nationalId,
      licenseNumber: user.licenseNumber,
      pharmacyType: user.pharmacyType,
      token
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ================= LOGIN =================
exports.loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // If role is specified, verify it matches
      if (role && user.role !== role) {
        return res.status(403).json({ message: 'Access denied: Role mismatch' });
      }

      const token = generateToken(user._id, user.role);

      return res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        nationalId: user.nationalId,
        licenseNumber: user.licenseNumber,
        pharmacyType: user.pharmacyType,
        token
      });
    }

    return res.status(401).json({
      message: 'Invalid email or password'
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ================= GET PROFILE =================
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      licenseNumber: user.licenseNumber,
      workingHours: user.workingHours,
      pharmacyStatus: user.pharmacyStatus,
      profilePhoto: user.profilePhoto || "",
      addresses: user.addresses || []
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE PROFILE =================
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.email = req.body.email || user.email;
    
    if (req.body.licenseNumber !== undefined) user.licenseNumber = req.body.licenseNumber;
    if (req.body.workingHours) user.workingHours = req.body.workingHours;
    if (req.body.pharmacyStatus) user.pharmacyStatus = req.body.pharmacyStatus;
    
    if (req.body.profilePhoto !== undefined) user.profilePhoto = req.body.profilePhoto;
    if (req.body.addresses !== undefined) user.addresses = req.body.addresses;

    if (req.body.password) {
      user.passwordHash = req.body.password;
    }

    const updatedUser = await user.save();

    return res.json({
      _id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
      profilePhoto: updatedUser.profilePhoto || "",
      addresses: updatedUser.addresses || [],
      token: generateToken(updatedUser._id, updatedUser.role)
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
exports.getProfileById = async (req, res) => {

  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json(user);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};