const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplier.controller');

router.get('/', supplierController.getAll);
router.post('/', supplierController.create);
router.put('/:id', supplierController.update);
router.delete('/:id', supplierController.delete);

module.exports = router;