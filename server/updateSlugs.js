// Script để cập nhật slug cho tất cả sách đã có trong database
require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/books.model');
const slugify = require('slugify');

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGODB_CONNECT_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Lấy tất cả sách
      const books = await Book.find({});
      console.log(`Found ${books.length} books. Updating slugs...`);
      
      // Duyệt qua từng sách và cập nhật slug
      for (let i = 0; i < books.length; i++) {
        const book = books[i];
        
        // Tạo slug từ tên sách
        let slug = slugify(book.name, {
          lower: true,
          strict: true,
          locale: 'vi',
          trim: true
        });
        
        // Kiểm tra xem slug này có bị trùng không
        const slugExists = await Book.findOne({ 
          slug,
          _id: { $ne: book._id } // Loại trừ sách hiện tại
        });
        
        // Nếu trùng, thêm identifier
        if (slugExists) {
          slug = `${slug}-${Date.now().toString().slice(-6)}`;
        }
        
        // Cập nhật slug
        book.slug = slug;
        await book.save();
        
        console.log(`Updated book ${i+1}/${books.length}: ${book.name} -> ${slug}`);
      }
      
      console.log('All books have been updated with slugs!');
    } catch (error) {
      console.error('Error updating slugs:', error);
    } finally {
      mongoose.connection.close();
    }
  })
  .catch((error) => {
    console.error('Could not connect to MongoDB:', error);
  });
