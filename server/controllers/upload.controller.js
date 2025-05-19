const { cloudinary } = require('../config/cloudinary')

const uploadController = {
    uploadImage: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    message: 'Không có file được tải lên',
                    error: 1,
                })
            }

            // Convert file buffer to base64 string for Cloudinary upload
            const fileStr = req.file.buffer.toString('base64')
            const uploadResponse = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${fileStr}`,
                { folder: 'bookstore' }
            )

            return res.status(200).json({
                message: 'success',
                error: 0,
                data: {
                    secure_url: uploadResponse.secure_url,
                    public_id: uploadResponse.public_id
                }
            })
        } catch (error) {
            console.error('Upload error:', error)
            return res.status(500).json({
                message: `Có lỗi xảy ra khi tải lên ảnh! ${error.message}`,
                error: 1,
            })
        }
    }
}

module.exports = uploadController
