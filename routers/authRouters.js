const express = require('express');
const router = express.Router();

const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile, 
  getProfileById,
  updateProfileById 
} = require('../../controllers/authControllers');

const protect = require('../../middleware/authMiddleware').protect || require('../../middleware/authMiddleware');

router.post('/auth/register', registerUser);
router.post('/auth/login', loginUser);

router.get('/users/profile', protect, getUserProfile);
router.put('/users/profile', protect, updateUserProfile);
router.get('/users/profilebyid/:id', protect, getProfileById);

module.exports = router;