const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotion.controller');

router.post('/', promotionController.create);
router.get('/', promotionController.getAll);
router.get('/:id', promotionController.getById);
router.put('/:id', promotionController.update);
router.delete('/:id', promotionController.delete);

module.exports = router;