const express = require('express');
const router = express.Router();
const favouritesController = require('../../controllers/favouritesControllers');
router.post('/add', favouritesController.addFavorite);
router.get('/:userId', favouritesController.getFavorites);
router.delete('/:id', favouritesController.deleteFavorite);
module.exports = router;