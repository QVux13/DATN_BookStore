const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const promotionSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    discountType: { 
      type: String, 
      enum: ["percent", "amount", "fixed"], // Thêm fixed cho đồng giá
      required: true 
    },
    value: { type: Number, required: true }, // % giảm giá, số tiền giảm, hoặc giá đồng giá
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Book" }],
    genres: [{ type: Schema.Types.ObjectId, ref: "Genre" }],
    authors: [{ type: Schema.Types.ObjectId, ref: "Author" }],
    publishers: [{ type: Schema.Types.ObjectId, ref: "Publisher" }],
    isActive: { type: Boolean, default: true }
  }
);

module.exports = mongoose.model("Promotion", promotionSchema);