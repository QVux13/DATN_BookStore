const multer = require('multer')

// Cấu hình lưu trữ file trong bộ nhớ
const storage = multer.memoryStorage()

// Filter file để chỉ chấp nhận hình ảnh
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new Error('File không phải là hình ảnh!'), false)
    }
}

// Giới hạn kích thước file 1MB
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 1024 * 1024 }
})

module.exports = upload
