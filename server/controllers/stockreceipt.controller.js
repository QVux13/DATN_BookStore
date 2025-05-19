const stockReceiptService = require('../services/stockreceipt.service');
const Book = require('../models/books.model');

exports.getAll = async (req, res) => {
  try {
    const receipts = await stockReceiptService.getAll();
    res.json({ data: receipts });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { book, supplier, quantity, importPrice } = req.body;
    const receipt = await stockReceiptService.create({ book, supplier, quantity, importPrice });
    await Book.findByIdAndUpdate(book, { $inc: { stock: quantity } });
    res.status(201).json(receipt);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const receipt = await stockReceiptService.deleteById(req.params.id);
    if (!receipt) return res.status(404).json({ message: "Không tìm thấy phiếu nhập kho!" });
    await Book.findByIdAndUpdate(receipt.book, { $inc: { stock: -receipt.quantity } });
    res.json({ message: "Đã xóa phiếu nhập kho!" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};