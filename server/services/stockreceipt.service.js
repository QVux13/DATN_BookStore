const StockReceipt = require('../models/stockReceipt.model');

const stockReceiptService = {
    getAll: async () => {
        return await StockReceipt.find()
            .populate('book')
            .populate('supplier')
            .sort({ importDate: -1 });
    },
    getById: async (id) => {
        return await StockReceipt.findById(id)
            .populate('book')
            .populate('supplier');
    },
    create: async (data) => {
        const newReceipt = new StockReceipt(data);
        return await newReceipt.save();
    },
    deleteById: async (id) => {
        return await StockReceipt.findByIdAndDelete(id);
    }
};

module.exports = stockReceiptService;