require('dotenv').config();
const mongoose = require('mongoose');

// Dữ liệu giả cho thể loại sách
const genreSeedData = [
    { name: "Tiểu thuyết" ,slug : "tieu-thuyet"},
    { name: "Khoa học viễn tưởng"  ,slug : "khoa-hoc-vien-tuong"},
    { name: "Trinh thám" ,slug : "trinh-tham"},
    { name: "Lãng mạn"  ,slug : "lang-man"},
    { name: "Tự truyện"  ,slug : "tu-truyen"},
    { name: "Lịch sử" ,slug : "lich-su"},
    { name: "Kinh doanh" ,slug : "kinh-doanh"},
    { name: "Tâm lý học" ,slug : "tam-ly-hoc"},
    { name: "Phát triển bản thân" ,slug : "phat-trien-ban-than"},
    { name: "Thiếu nhi" ,slug : "thieu-nhi"}
];

// Dữ liệu giả cho nhà xuất bản
const publisherSeedData = [
    { name: "NXB Kim Đồng" ,slug : "nxb-kim-dong"},
    { name: "NXB Trẻ" ,slug : "nxb-tre"},
    { name: "NXB Tổng hợp TP.HCM" ,slug : "nxb-tong-hop-tp-hcm"},
    { name: "NXB Hội Nhà văn" ,slug : "nxb-hoi-nha-van"},
    { name: "NXB Giáo dục Việt Nam" ,slug : "nxb-giao-duc-viet-nam"},
    { name: "NXB Văn học" ,slug : "nxb-van-hoc"},
    { name: "NXB Thanh Niên" ,slug : "nxb-thanh-nien"},
    { name: "NXB Phụ nữ" ,slug : "nxb-phu-nu"},
    { name: "First News" ,slug : "first-news"},
    { name: "Nhã Nam" ,slug : "nhã-nam"}
];

async function manualSeed() {
  console.log('Starting manual seed process...');
  
  try {
    // Kết nối đến MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect("mongodb+srv://tien:toilaso1@cluster0.inww0ej.mongodb.net/bansach?retryWrites=true&w=majority")
    console.log('MongoDB connection successful!');
    
    // Xóa và tạo lại collections
    console.log('Recreating collections...');
    
    // Genres
    if (mongoose.connection.collections['genres']) {
      console.log('Dropping genres collection...');
      await mongoose.connection.dropCollection('genres');
    }
    
    console.log('Creating genres collection...');
    const genresCollection = await mongoose.connection.createCollection('genres');
    console.log('Inserting genre data...');
    await genresCollection.insertMany(genreSeedData);
    console.log('Genres added successfully!');
    
    // Publishers
    if (mongoose.connection.collections['publishers']) {
      console.log('Dropping publishers collection...');
      await mongoose.connection.dropCollection('publishers');
    }
    
    console.log('Creating publishers collection...');
    const publishersCollection = await mongoose.connection.createCollection('publishers');
    console.log('Inserting publisher data...');
    await publishersCollection.insertMany(publisherSeedData);
    console.log('Publishers added successfully!');
    
    console.log('Seed process completed successfully!');
    
  } catch (error) {
    console.error('Error during seed process:', error);
  } finally {
    try {
      if (mongoose.connection.readyState) {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
      }
    } catch (closeError) {
      console.error('Error closing MongoDB connection:', closeError);
    }
    
    console.log('Exiting process...');
    process.exit(0);
  }
}

// Run the seed function
manualSeed();
