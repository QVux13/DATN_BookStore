const router = require('express').Router();
const seedController = require('../controllers/seed.controller');

// Thêm dữ liệu giả cho thể loại sách
router.post('/genres', seedController.seedGenres);

// Thêm dữ liệu giả cho nhà xuất bản
router.post('/publishers', seedController.seedPublishers);

// Thêm tất cả dữ liệu giả
router.post('/all', seedController.seedAll);

module.exports = router;
