const express = require('express');
const router = express.Router();
const stockReceiptController = require('../controllers/stockreceipt.controller');

router.get('/', stockReceiptController.getAll);
router.post('/', stockReceiptController.create);
router.delete('/:id', stockReceiptController.delete);

module.exports = router;