const Book = require('../models/books.model')
const Order = require('../models/orders.model')
const mongoose = require("mongoose");
const slugify = require('slugify');

const bookService = {
    getAll: async({query, page, limit, sort}) => {
        const skip = (page - 1) * limit
            
        return await Promise.all([
            Book.countDocuments(query), 
            Book.find(query).populate('genre author publisher').skip(skip).limit(limit).sort(sort)])
    },
    getByBookId: async(bookId) => {
        return await Book.findOne({bookId: bookId}).populate('author publisher genre')
    },
    getById: async(id) => {
        return await Book.findById(id).populate('author publisher genre')
       
    },
    getBySlug: async(slug) => {
        return await Book.findOne({slug}).populate('author publisher genre')
    },
    checkIsOrdered: async(id) => {
        const ObjectId = mongoose.Types.ObjectId;
        return await Order.aggregate([
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.product", 
                }
            },
            { $match : { _id : ObjectId(id) } }
        ])
    },
    search: async({key, page, limit}) => {
        const query = [
            {
                $lookup: {
                    from: "authors",
                    localField: "author",
                    foreignField: "_id",
                    as: "author"
                }
            },
            { 
                $match: {
                    $or: [
                        { name: { $regex: key, $options:"i" } }, 
                        { "author.name": { $regex: key, $options:"i" } } 
                    ]
                }
            },
        ]
        if (limit && +limit > 0) {
            const skip = (page - 1) * limit
            query.push({ $skip : skip }, { $limit: limit })
        }
        return await Book.aggregate(query)
    },    create: async(body) => {
        const { bookId, name, year, genre, author, publisher, description,
            pages, size, price, discount, imageUrl, publicId } = body
        
        // Tạo slug từ tên sách
        let slug = slugify(name, {
            lower: true,
            strict: true,
            locale: 'vi',
            trim: true
        });
        
        // Kiểm tra xem slug đã tồn tại chưa
        const slugExists = await Book.findOne({ slug });
        
        // Nếu slug đã tồn tại, thêm một identifier ngẫu nhiên
        if (slugExists) {
            slug = `${slug}-${Date.now().toString().slice(-6)}`;
        }
        
        const newBook = new Book({
            bookId, name, slug, year, genre, description,
            author, publisher, pages, size, price, discount, imageUrl, publicId
        });
        
        return await newBook.save();
    },    updateById: async(id, body) => {
        const { name, year, genre, author, publisher, description,
            pages, size, price, discount, imageUrl, publicId } = body
        
        // Chỉ cập nhật slug nếu tên sách thay đổi
        let updateData = {
            name, year, genre, author, publisher, description,
            pages, size, price, discount
        };
        
        // Nếu tên thay đổi, cần cập nhật lại slug
        if (name) {
            const book = await Book.findById(id);
            if (book && book.name !== name) {
                let slug = slugify(name, {
                    lower: true,
                    strict: true,
                    locale: 'vi',
                    trim: true
                });
                
                // Kiểm tra xem slug mới đã tồn tại chưa (trừ cuốn sách hiện tại)
                const slugExists = await Book.findOne({ 
                    slug, 
                    _id: { $ne: id } 
                });
                
                // Nếu slug đã tồn tại, thêm một identifier ngẫu nhiên
                if (slugExists) {
                    slug = `${slug}-${Date.now().toString().slice(-6)}`;
                }
                
                updateData.slug = slug;
            }
        }
        
        if (imageUrl && publicId) {
            updateData.imageUrl = imageUrl;
            updateData.publicId = publicId;
        }
        
        return await Book.findByIdAndUpdate(
            id,
            updateData,
            {new: true}
        );
    },
    deleteById: async(id) => {
        return await Book.findByIdAndDelete(id)
    }
}

module.exports = bookService
