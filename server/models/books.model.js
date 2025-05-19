const mongoose = require("mongoose");
const slugify = require("slugify");

const Schema = mongoose.Schema;

const bookSchema = new Schema(
  {
    bookId: {
      type: String,
      required: true,
      unique: true,
    },    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    year: { type: Number },
    genre: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Genre",
      },
    ],
    author: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Author",
      },
    ],
    publisher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Publisher",
    },
    description: { type: String },
    pages: { type: Number },
    size: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    discountType: {
      type: String,
      enum: ['percent', 'amount', 'fixed'],
      default: null
    },
    finalPrice: { type: Number }, // Thêm trường này
    imageUrl: {
      type: String,
      default: "https://itbook.store/img/books/9781617294136.png",
    },
    publicId: { type: String },
  },
  {
    timestamps: true,
    }
);

// Tạo chỉ mục để tăng tốc độ tìm kiếm theo slug
bookSchema.index({ slug: 1 });

// Middleware để tự động tạo slug trước khi lưu
bookSchema.pre('save', function(next) {
  // Chỉ tạo slug nếu tên sách được thay đổi hoặc là document mới
  if (this.isModified('name') || this.isNew) {
    // Lưu ý: Không cần xử lý slug ở đây vì đã xử lý ở service
    // để đảm bảo tính duy nhất của slug
    if (!this.slug) {
      this.slug = slugify(this.name, {
        lower: true,       // Chuyển thành chữ thường
        strict: true,      // Loại bỏ các ký tự đặc biệt
        locale: 'vi',      // Hỗ trợ tiếng Việt
        trim: true         // Cắt khoảng trắng
      });
    }
  }
  next();
});

module.exports = mongoose.model("Book", bookSchema);
