const express = require('express');
const router = express.Router();    
const { addCartByUserId } = require('../../controllers/cartControllers');

router.post('/', addCartByUserId); 
module.exports = router;