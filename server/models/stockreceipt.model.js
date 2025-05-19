const mongoose = require('mongoose');

const Schema = mongoose.Schema

const stockReceiptSchema = new Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  quantity: { type: Number, required: true },
  importPrice: { type: Number, required: true },
  importDate: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('StockReceipt', stockReceiptSchema);
