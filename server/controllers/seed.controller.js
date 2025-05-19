const Genre = require('../models/genres.model');
const Publisher = require('../models/publishers.model');

// Dữ liệu giả cho thể loại sách
const genreSeedData = [
    { name: "Tiểu thuyết" },
    { name: "Khoa học viễn tưởng" },
    { name: "Trinh thám" },
    { name: "Lãng mạn" },
    { name: "Tự truyện" },
    { name: "Lịch sử" },
    { name: "Kinh doanh" },
    { name: "Tâm lý học" },
    { name: "Phát triển bản thân" },
    { name: "Thiếu nhi" },
    { name: "Truyện tranh" },
    { name: "Thơ ca" },
    { name: "Văn học cổ điển" },
    { name: "Kinh tế" },
    { name: "Chính trị" },
    { name: "Khoa học" },
    { name: "Hồi ký" },
    { name: "Du lịch" },
    { name: "Ẩm thực" },
    { name: "Giáo dục" }
];

// Dữ liệu giả cho nhà xuất bản
const publisherSeedData = [
    { name: "NXB Kim Đồng" },
    { name: "NXB Trẻ" },
    { name: "NXB Tổng hợp TP.HCM" },
    { name: "NXB Hội Nhà văn" },
    { name: "NXB Giáo dục Việt Nam" },
    { name: "NXB Đại học Quốc gia Hà Nội" },
    { name: "NXB Chính trị Quốc gia" },
    { name: "NXB Văn học" },
    { name: "NXB Thanh Niên" },
    { name: "NXB Phụ nữ" },
    { name: "NXB Lao động" },
    { name: "NXB Thế giới" },
    { name: "NXB Đà Nẵng" },
    { name: "Penguin Random House" },
    { name: "HarperCollins" },
    { name: "First News" },
    { name: "Alpha Books" },
    { name: "Nhã Nam" },
    { name: "Omega Plus" },
    { name: "Skybooks" }
];

const seedController = {
    seedGenres: async (req, res) => {
        try {
            // Xóa dữ liệu cũ nếu có
            await Genre.deleteMany({});
            
            // Thêm dữ liệu mới
            const insertedGenres = await Genre.insertMany(genreSeedData);
            
            res.status(200).json({
                success: true,
                message: `Đã thêm ${insertedGenres.length} thể loại sách vào database`,
                data: insertedGenres
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi thêm dữ liệu thể loại sách',
                error: error.message
            });
        }
    },
    
    seedPublishers: async (req, res) => {
        try {
            // Xóa dữ liệu cũ nếu có
            await Publisher.deleteMany({});
            
            // Thêm dữ liệu mới
            const insertedPublishers = await Publisher.insertMany(publisherSeedData);
            
            res.status(200).json({
                success: true,
                message: `Đã thêm ${insertedPublishers.length} nhà xuất bản vào database`,
                data: insertedPublishers
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi thêm dữ liệu nhà xuất bản',
                error: error.message
            });
        }
    },
    
    seedAll: async (req, res) => {
        try {
            // Xóa dữ liệu cũ nếu có
            await Genre.deleteMany({});
            await Publisher.deleteMany({});
            
            // Thêm dữ liệu mới
            const insertedGenres = await Genre.insertMany(genreSeedData);
            const insertedPublishers = await Publisher.insertMany(publisherSeedData);
            
            res.status(200).json({
                success: true,
                message: 'Đã thêm dữ liệu giả thành công',
                data: {
                    genres: {
                        count: insertedGenres.length,
                        data: insertedGenres
                    },
                    publishers: {
                        count: insertedPublishers.length,
                        data: insertedPublishers
                    }
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi thêm dữ liệu giả',
                error: error.message
            });
        }
    }
};

module.exports = seedController;
